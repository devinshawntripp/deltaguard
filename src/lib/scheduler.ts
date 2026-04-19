import { prisma } from "@/lib/prisma";
import { createRegistryJob } from "@/lib/jobs";
import { getScannerSettings } from "@/lib/scannerSettings";
import { incrementUsage } from "@/lib/usage";
import { CronExpressionParser } from "cron-parser";

export type ScanSchedule = {
    id: string;
    org_id: string;
    registry_config_id: string | null;
    image_ref: string;
    cron_expr: string;
    scan_mode: string;
    enabled: boolean;
    last_run_at: string | null;
    next_run_at: string | null;
    created_at: string;
    updated_at: string;
};

export function computeNextRun(cronExpression: string): Date {
    const interval = CronExpressionParser.parse(cronExpression);
    return interval.next().toDate();
}

export function isValidCron(cronExpression: string): boolean {
    try {
        CronExpressionParser.parse(cronExpression);
        return true;
    } catch {
        return false;
    }
}

export async function checkAndRunSchedules(): Promise<{
    triggered: number;
    errors: string[];
}> {
    const now = new Date();
    let triggered = 0;
    const errors: string[] = [];

    const dueSchedules = await prisma.$queryRaw<ScanSchedule[]>`
        SELECT id, org_id, registry_config_id, image_ref, cron_expr, scan_mode,
               enabled, last_run_at::text, next_run_at::text, created_at::text, updated_at::text
        FROM scan_schedules
        WHERE enabled = true
          AND (next_run_at IS NULL OR next_run_at <= ${now})
        ORDER BY next_run_at ASC NULLS FIRST
        LIMIT 100
    `;

    for (const schedule of dueSchedules) {
        try {
            const settings = await getScannerSettings(schedule.org_id);

            await createRegistryJob({
                registry_config_id: schedule.registry_config_id,
                registry_image: schedule.image_ref,
                org_id: schedule.org_id,
                created_by_user_id: null,
                created_by_api_key_id: null,
                settings_snapshot: settings,
            });

            // Count scheduled scans toward the org's monthly usage
            await incrementUsage(schedule.org_id, "api");

            const nextRun = computeNextRun(schedule.cron_expr);

            await prisma.$executeRaw`
                UPDATE scan_schedules
                SET last_run_at = ${now},
                    next_run_at = ${nextRun},
                    updated_at = NOW()
                WHERE id = ${schedule.id}::uuid
            `;

            triggered++;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`schedule ${schedule.id}: ${msg}`);
        }
    }

    return { triggered, errors };
}

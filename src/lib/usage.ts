import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export type OrgPlanUsage = {
    planCode: string;
    planName: string;
    monthlyLimit: number | null;
    used: number;
    remaining: number | null;
};

function currentYearMonth(date = new Date()): string {
    const y = date.getUTCFullYear();
    const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
    return `${y}-${m}`;
}

async function getPlanForOrg(orgId: string): Promise<{ code: string; name: string; monthly_limit: number | null }> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ code: string; name: string; monthly_limit: number | null }>>`
SELECT
  COALESCE(p.code, 'FREE') AS code,
  COALESCE(p.name, 'Free') AS name,
  p.monthly_scan_limit AS monthly_limit
FROM orgs o
LEFT JOIN org_billing ob ON ob.org_id = o.id AND ob.status IN ('active', 'trialing', 'past_due')
LEFT JOIN plans p ON p.id = ob.plan_id AND p.active = TRUE
WHERE o.id=${orgId}::uuid
LIMIT 1
    `;

    const row = rows[0];
    if (!row) {
        return { code: "FREE", name: "Free", monthly_limit: 25 };
    }

    if (!row.monthly_limit && row.code !== "ENTERPRISE") {
        // If no explicit plan row matched, default to FREE quota.
        return { code: "FREE", name: "Free", monthly_limit: 25 };
    }

    return row;
}

async function getCurrentUsage(orgId: string, yearMonth: string): Promise<number> {
    const rows = await prisma.$queryRaw<Array<{ scan_count_total: number }>>`
SELECT scan_count_total
FROM org_usage_monthly
WHERE org_id=${orgId}::uuid AND year_month=${yearMonth}
LIMIT 1
    `;
    return Number(rows[0]?.scan_count_total || 0);
}

export async function getOrgPlanUsage(orgId: string): Promise<OrgPlanUsage> {
    await ensurePlatformSchema();
    const ym = currentYearMonth();
    const plan = await getPlanForOrg(orgId);
    const used = await getCurrentUsage(orgId, ym);
    const remaining = plan.monthly_limit == null ? null : Math.max(0, plan.monthly_limit - used);
    return {
        planCode: plan.code,
        planName: plan.name,
        monthlyLimit: plan.monthly_limit,
        used,
        remaining,
    };
}

export async function canQueueScan(orgId: string): Promise<{ allowed: boolean; usage: OrgPlanUsage }> {
    const usage = await getOrgPlanUsage(orgId);
    if (usage.monthlyLimit == null) {
        return { allowed: true, usage };
    }
    return { allowed: usage.used < usage.monthlyLimit, usage };
}

export async function incrementUsage(orgId: string, channel: "ui" | "api"): Promise<void> {
    await ensurePlatformSchema();
    const ym = currentYearMonth();
    const isUi = channel === "ui" ? 1 : 0;
    const isApi = channel === "api" ? 1 : 0;
    await prisma.$executeRaw`
INSERT INTO org_usage_monthly (org_id, year_month, scan_count_total, scan_count_api, scan_count_ui, updated_at)
VALUES (${orgId}::uuid, ${ym}, 1, ${isApi}, ${isUi}, now())
ON CONFLICT (org_id, year_month)
DO UPDATE SET
  scan_count_total = org_usage_monthly.scan_count_total + 1,
  scan_count_api = org_usage_monthly.scan_count_api + ${isApi},
  scan_count_ui = org_usage_monthly.scan_count_ui + ${isUi},
  updated_at = now()
    `;
}

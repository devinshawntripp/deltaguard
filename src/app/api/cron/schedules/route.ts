import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE } from "@/lib/roles";
import { checkAndRunSchedules } from "@/lib/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest, actor: { rolesMask: bigint } | null): boolean {
    if (actor && actor.rolesMask === ADMIN_OVERRIDE) return true;
    const secret = process.env.CLEANUP_SECRET;
    if (secret) {
        const header = req.headers.get("x-cleanup-secret") || "";
        if (header === secret) return true;
    }
    return false;
}

export async function POST(req: NextRequest) {
    const actor = await resolveRequestActor(req).catch(() => null);
    if (!isAuthorized(req, actor)) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const result = await checkAndRunSchedules();
    console.log(
        `[cron/schedules] Triggered ${result.triggered} schedules${result.errors.length > 0 ? `, ${result.errors.length} errors` : ""}`,
    );
    return NextResponse.json(result);
}

import { NextRequest, NextResponse } from "next/server";
import { actorHasAnyRole, forbiddenByRole, JOB_WRITE_ROLES, resolveRequestActor } from "@/lib/authz";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISPATCHER_URL = process.env.DISPATCHER_URL || "http://scanrook-dispatcher.scanrook.svc:8080";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(_req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_WRITE_ROLES)) {
        return forbiddenByRole(actor, JOB_WRITE_ROLES, "cancel job");
    }

    const { id } = await context.params;

    try {
        const res = await fetch(`${DISPATCHER_URL}/jobs/${id}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(15000),
        });
        const body = await res.json();
        if (res.ok) {
            audit({ actor, action: "scan.cancelled", targetType: "scan_job", targetId: id, ip: getClientIp(_req) });
        }
        return NextResponse.json(body, { status: res.status });
    } catch (e: any) {
        return NextResponse.json(
            { error: `Dispatcher unreachable: ${e.message}` },
            { status: 502 },
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import {
    actorHasAnyRole,
    forbiddenByRole,
    JOB_WRITE_ROLES,
    resolveRequestActor,
} from "@/lib/authz";
import { authorizeDeviceCode, consumeDeviceGrant } from "@/lib/cliDeviceAuth";
import { createOrgApiKey } from "@/lib/apiKeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const deviceCode = String(body?.device_code || "").trim();
    if (!deviceCode) {
        return NextResponse.json({ error: "device_code required" }, { status: 400 });
    }

    const approve = Boolean(body?.approve);
    if (approve) {
        const actor = await resolveRequestActor(req);
        if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!actorHasAnyRole(actor, JOB_WRITE_ROLES)) {
            return forbiddenByRole(actor, JOB_WRITE_ROLES, "approve CLI device login");
        }

        const keyName = String(body?.name || "scanrook-cli");
        const created = await createOrgApiKey({
            orgId: actor.orgId,
            name: keyName,
            rolesMask: actor.rolesMask.toString(),
            createdByUserId: actor.userId,
        });
        const approved = await authorizeDeviceCode(
            deviceCode,
            created.token,
            actor.orgId,
            actor.rolesMask.toString(),
        );
        if (approved !== "ok") {
            return NextResponse.json({ error: "device code not found or expired" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, status: "authorized" });
    }

    try {
        const poll = await consumeDeviceGrant(deviceCode);
        return NextResponse.json(poll, { status: 200 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg, code: "device_complete_failed" }, { status: 503 });
    }
}

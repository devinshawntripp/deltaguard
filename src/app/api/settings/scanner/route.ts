import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { getScannerSettings, setScannerSettings } from "@/lib/scannerSettings";
import { ADMIN_OVERRIDE, ROLE_ORG_OWNER, ROLE_SCAN_ADMIN, ROLE_POLICY_ADMIN } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_SETTINGS_ROLES = [ROLE_SCAN_ADMIN, ROLE_POLICY_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        feature: "view scanner settings",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const settings = await getScannerSettings(actor.orgId);
    return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: ADMIN_SETTINGS_ROLES,
        requiredKinds: ["user"],
        feature: "update scanner settings",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    try {
        const body = await req.json();
        const settings = await setScannerSettings(actor.orgId, body);
        return NextResponse.json(settings);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

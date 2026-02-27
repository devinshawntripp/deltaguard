import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { isUserActiveInOrg, listUserOrgs } from "@/lib/orgs";
import { setUserActiveOrg } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        feature: "view active organization",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;
    if (!actor.userId) {
        return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }

    const items = await listUserOrgs(actor.userId);
    return NextResponse.json({
        org_id: actor.orgId,
        items,
    });
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        feature: "switch active organization",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;
    if (!actor.userId) {
        return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }

    try {
        const body = (await req.json()) as { org_id?: string };
        const orgId = String(body?.org_id || "").trim();
        if (!orgId) {
            return NextResponse.json({ error: "org_id is required" }, { status: 400 });
        }
        const allowed = await isUserActiveInOrg(actor.userId, orgId);
        if (!allowed) {
            return NextResponse.json({ error: "not an active member of target org" }, { status: 403 });
        }

        await setUserActiveOrg(actor.userId, orgId);
        return NextResponse.json({ ok: true, org_id: orgId });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

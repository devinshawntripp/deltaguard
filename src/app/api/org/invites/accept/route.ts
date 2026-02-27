import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { acceptOrgInvite } from "@/lib/orgs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        feature: "accept org invite",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    if (!actor.userId || !actor.email) {
        return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }

    try {
        const body = (await req.json()) as { token?: string };
        const token = String(body?.token || "").trim();
        if (!token) {
            return NextResponse.json({ error: "token is required" }, { status: 400 });
        }

        const accepted = await acceptOrgInvite({
            token,
            userId: actor.userId,
            userEmail: actor.email,
        });
        if (!accepted.ok) {
            return NextResponse.json({ error: accepted.reason }, { status: 400 });
        }

        return NextResponse.json({ ok: true, org_id: accepted.orgId });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

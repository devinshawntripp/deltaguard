import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { createOrgForUser, listUserOrgs } from "@/lib/orgs";
import { ADMIN_OVERRIDE, ROLE_ORG_OWNER } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORG_CREATE_ROLES = [ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        feature: "list organizations",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    if (!actor.userId) {
        return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }

    const orgs = await listUserOrgs(actor.userId);
    return NextResponse.json({ items: orgs });
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        requiredRoles: ORG_CREATE_ROLES,
        feature: "create organization",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    if (!actor.userId) {
        return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }

    try {
        const body = (await req.json()) as { name?: string; slug?: string };
        const name = String(body?.name || "").trim();
        const slug = String(body?.slug || "").trim();
        if (!name) {
            return NextResponse.json({ error: "name is required" }, { status: 400 });
        }

        const org = await createOrgForUser({
            userId: actor.userId,
            name,
            slug,
        });
        return NextResponse.json({ ok: true, org });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

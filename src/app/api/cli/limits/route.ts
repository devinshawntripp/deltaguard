import { NextRequest, NextResponse } from "next/server";
import { getCliEnrichLimit } from "@/lib/cliAccess";
import { resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const actor = await resolveRequestActor(req, { allowAnonymous: true });
    if (!actor) {
        return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }
    const status = await getCliEnrichLimit(req, actor);
    return NextResponse.json(status, { status: 200 });
}

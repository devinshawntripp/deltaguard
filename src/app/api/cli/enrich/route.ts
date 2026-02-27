import { NextRequest, NextResponse } from "next/server";
import { consumeCliEnrichLimit } from "@/lib/cliAccess";
import { resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const actor = await resolveRequestActor(req, { allowAnonymous: true });
    if (!actor) {
        return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }

    const status = await consumeCliEnrichLimit(req, actor);
    if (!status.allowed) {
        return NextResponse.json(status, { status: 429 });
    }
    return NextResponse.json(status, { status: 200 });
}

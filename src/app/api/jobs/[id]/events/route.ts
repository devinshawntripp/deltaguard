import { NextRequest } from "next/server";
import { jobEventsBus } from "@/lib/jobEventsBus";
import { actorHasAnyRole, forbiddenByRoleResponse, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";
import { getJob } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sseHeaders() {
    return new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
    });
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(req);
    if (!actor) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRoleResponse(actor, JOB_READ_ROLES, "stream job events");
    }

    const { id } = await context.params;
    const job = await getJob(id, actor.orgId);
    if (!job) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    const sinceRaw = req.nextUrl.searchParams.get("since_id");
    const sinceId = Number(sinceRaw || 0);
    const safeSinceId = Number.isFinite(sinceId) && sinceId > 0 ? Math.trunc(sinceId) : 0;

    const encoder = new TextEncoder();
    let unsub: (() => void) | null = null;
    let closed = false;
    const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
            const send = (obj: unknown) => {
                if (closed) return;
                try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)); } catch { closed = true; }
            };
            controller.enqueue(encoder.encode(`: ping\n\n`));
            unsub = await jobEventsBus.subscribe(id, (row) => send(row), { sinceId: safeSinceId });
        },
        cancel() { closed = true; try { unsub?.(); } catch { } },
    });
    return new Response(stream, { headers: sseHeaders() });
}

import type { NextRequest } from "next/server";
import { listJobs, getJob } from "@/lib/jobs";
import { jobsBus } from "@/lib/jobsBus";
import { actorHasAnyRole, forbiddenByRoleResponse, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";

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

export async function GET(req: NextRequest) {
    const actor = await resolveRequestActor(req);
    if (!actor) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRoleResponse(actor, JOB_READ_ROLES, "stream jobs");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
            const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            controller.enqueue(encoder.encode(`: ping\n\n`));
            let closed = false;

            // initial snapshot direct from DB (limit to recent and surface running first)
            try {
                const items = await listJobs(100, actor.orgId);
                items.sort((a: any, b: any) => {
                    const rank = (s: string) => (s === 'running' ? 0 : s === 'queued' ? 1 : 2);
                    const r = rank(a.status) - rank(b.status);
                    return r !== 0 ? r : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                send({ type: "snapshot", items });
            } catch { }

            // Reuse a singleton jobs bus to avoid multiple listeners accumulating
            await jobsBus.start();
            const unsub = jobsBus.subscribe(async (payload) => {
                if (closed) return;
                // Notifications now carry only the job id; fetch the full row so the
                // client receives a complete item (backward-compatible with existing UI).
                if (payload.type === "changed" && payload.id) {
                    try {
                        const job = await getJob(payload.id, actor.orgId);
                        if (job) {
                            send({ type: "changed", item: job });
                            return;
                        }
                        if (payload.deleted === true) {
                            send({ type: "changed", item: { id: payload.id, deleted: true } });
                        }
                    } catch { send(payload); }
                } else {
                    send(payload);
                }
            });
            (controller as any).onCancel = () => { closed = true; unsub(); };
        },
    });
    return new Response(stream, { headers: sseHeaders() });
}

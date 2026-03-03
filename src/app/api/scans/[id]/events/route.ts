import { NextRequest } from "next/server";
import { JOB_READ_ROLES, requireRequestActor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { jobEventsBus } from "@/lib/jobEventsBus";

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

const TERMINAL_STAGES = new Set(["scan.done", "scan.summary", "scan.error", "scan.err", "worker.stale.fail"]);

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user", "api_key"],
        requiredRoles: JOB_READ_ROLES,
        feature: "stream scan events",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const { id: scanId } = await context.params;

    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
SELECT id::text AS id
FROM scan_jobs
WHERE id=${scanId}::uuid
  AND org_id=${actor.orgId}::uuid
LIMIT 1
    `;
    if (!rows[0]) {
        return new Response(JSON.stringify({ error: "scan not found", code: "not_found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
        });
    }

    const encoder = new TextEncoder();
    let closed = false;
    let unsubscribe: (() => void) | null = null;

    const lastEventId = req.headers.get("Last-Event-ID");
    const sinceId = lastEventId ? parseInt(lastEventId, 10) : undefined;

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(encoder.encode(`: ping\n\n`));

            unsubscribe = await jobEventsBus.subscribe(scanId, (row) => {
                if (closed) return;
                try {
                    controller.enqueue(encoder.encode(
                        `id: ${row.id}\ndata: ${JSON.stringify(row)}\n\n`
                    ));
                } catch {
                    closed = true;
                }
                if (TERMINAL_STAGES.has(String(row.stage).toLowerCase().trim())) {
                    closed = true;
                    try { controller.close(); } catch {}
                    unsubscribe?.();
                }
            }, { sinceId });

            // Heartbeat (15s interval — keeps connection alive through proxies)
            const hb = setInterval(() => {
                if (closed) { clearInterval(hb); return; }
                try { controller.enqueue(encoder.encode(`: ping\n\n`)); }
                catch { closed = true; clearInterval(hb); }
            }, 15000);
        },
        cancel() {
            closed = true;
            unsubscribe?.();
        },
    });

    return new Response(stream, { headers: sseHeaders() });
}

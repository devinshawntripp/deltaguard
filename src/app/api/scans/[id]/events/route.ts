import { NextRequest } from "next/server";
import { JOB_READ_ROLES, requireRequestActor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

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

type EventRow = { id: number | bigint; ts: string; stage: string; detail?: string | null; pct?: number | null };

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
    let pgClient: any = null;

    const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
            let lastId = 0;

            const sendBacklog = async () => {
                try {
                    const backlog = await prisma.$queryRaw<EventRow[]>`
SELECT id, ts::text, stage, detail, pct
FROM scan_events
WHERE job_id=${scanId}::uuid AND id > ${lastId}::bigint
ORDER BY id ASC
LIMIT 500
                    `;
                    for (const r of backlog) {
                        const rowId = typeof r.id === "bigint" ? Number(r.id) : Number(r.id);
                        if (rowId > lastId) lastId = rowId;
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(r)}\n\n`));
                        if (TERMINAL_STAGES.has(String(r.stage).toLowerCase().trim())) {
                            closed = true;
                            controller.close();
                            return;
                        }
                    }
                } catch { }
            };

            controller.enqueue(encoder.encode(`: ping\n\n`));
            await sendBacklog();
            if (closed) return;

            // Listen for new scan_events via PG NOTIFY
            try {
                const pg = await import("pg");
                pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
                await pgClient.connect();
                await pgClient.query("LISTEN scan_events");

                pgClient.on("notification", (msg: any) => {
                    if (closed) return;
                    if (msg.channel === "scan_events" && msg.payload === scanId) {
                        sendBacklog().catch(() => {});
                    }
                });

                pgClient.on("error", () => {
                    if (!closed) {
                        closed = true;
                        try { controller.close(); } catch { }
                    }
                });
            } catch {
                // If PG LISTEN fails, close the stream — client will reconnect
                closed = true;
                try { controller.close(); } catch { }
            }

            // Heartbeat to keep connection alive
            const hb = setInterval(() => {
                if (closed) { clearInterval(hb); return; }
                try { controller.enqueue(encoder.encode(`: ping\n\n`)); } catch { closed = true; clearInterval(hb); }
            }, 15000);

            (controller as any).onCancel = () => {
                closed = true;
                clearInterval(hb);
                try { pgClient?.end(); } catch { }
            };
        },
        cancel() {
            closed = true;
            try { pgClient?.end(); } catch { }
        },
    });

    return new Response(stream, { headers: sseHeaders() });
}

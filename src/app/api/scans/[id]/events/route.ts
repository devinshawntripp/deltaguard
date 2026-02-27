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

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user", "api_key"],
        requiredRoles: JOB_READ_ROLES,
        feature: "stream scan events",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const { id: scanId } = await context.params;

    // Enforce org ownership before tailing the on-disk progress stream.
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

    const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
            const dir = process.env.PROGRESS_DIR || "/tmp/deltaguard";
            const progressPath = `${dir}/${scanId}.ndjson`;
            // send backlog immediately if file exists
            try {
                const fs = await import("node:fs");
                if (fs.existsSync(progressPath)) {
                    const text = fs.readFileSync(progressPath, "utf8");
                    const lines = text ? text.split(/\r?\n/).filter(Boolean) : [];
                    try { console.log(`[sse] sending backlog lines for ${scanId}:`, lines.length); } catch { }
                    for (const line of lines.slice(-500)) {
                        controller.enqueue(encoder.encode(`data: ${line}\n\n`));
                    }
                    try {
                        const st = fs.statSync(progressPath);
                        console.log(`[sse] backlog for ${scanId} from`, progressPath, 'size', st.size);
                    } catch { }
                }
            } catch { }
            controller.enqueue(encoder.encode(`: ping\n\n`));

            let lastSize = 0;
            const fs = await import("node:fs");

            const pump = () => {
                try {
                    if (!fs.existsSync(progressPath)) return;
                    const text = fs.readFileSync(progressPath, "utf8");
                    const lines = text ? text.split(/\r?\n/).filter(Boolean) : [];
                    let sent = 0;
                    for (let i = lastSize; i < lines.length; i++) {
                        controller.enqueue(encoder.encode(`data: ${lines[i]}\n\n`));
                        sent++;
                    }
                    lastSize = lines.length;
                    if (sent > 0) {
                        try { console.log(`[sse] pumped ${sent} new events for ${scanId} (total ${lastSize})`); } catch { }
                    }
                } catch { }
            };

            const interval = setInterval(pump, 1000);
            (controller as any).onCancel = () => {
                closed = true;
                clearInterval(interval);
            };
        },
        cancel() { closed = true; },
    });

    return new Response(stream, { headers: sseHeaders() });
}


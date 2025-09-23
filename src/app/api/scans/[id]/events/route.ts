import { NextRequest } from "next/server";

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

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id: scanId } = await context.params;
    const encoder = new TextEncoder();
    let closed = false;

    const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
            const progressPath = `/tmp/deltaguard/${scanId}.ndjson`;
            // send backlog immediately if file exists
            try {
                const fs = await import("node:fs");
                if (fs.existsSync(progressPath)) {
                    const text = fs.readFileSync(progressPath, "utf8");
                    const lines = text ? text.split(/\r?\n/).filter(Boolean) : [];
                    for (const line of lines.slice(-500)) {
                        controller.enqueue(encoder.encode(`data: ${line}\n\n`));
                    }
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
                    for (let i = lastSize; i < lines.length; i++) {
                        controller.enqueue(encoder.encode(`data: ${lines[i]}\n\n`));
                    }
                    lastSize = lines.length;
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



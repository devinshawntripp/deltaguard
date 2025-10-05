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
    const { id } = await context.params;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
            const dir = process.env.PROGRESS_DIR || "/tmp/deltaguard";
            const progressPath = `${dir}/${id}.ndjson`;
            const send = (line: string) => controller.enqueue(encoder.encode(`data: ${line}\n\n`));
            controller.enqueue(encoder.encode(`: ping\n\n`));
            try {
                const fs = await import("node:fs");
                if (fs.existsSync(progressPath)) {
                    const text = fs.readFileSync(progressPath, "utf8");
                    const lines = text ? text.split(/\r?\n/).filter(Boolean) : [];
                    for (const l of lines.slice(-500)) send(l);
                }
            } catch { }
            let last = 0;
            const fs = await import("node:fs");
            const tick = () => {
                try {
                    if (!fs.existsSync(progressPath)) return;
                    const text = fs.readFileSync(progressPath, "utf8");
                    const lines = text ? text.split(/\r?\n/).filter(Boolean) : [];
                    for (let i = last; i < lines.length; i++) send(lines[i]);
                    last = lines.length;
                } catch { }
            };
            const interval = setInterval(tick, 1000);
            (controller as any).onCancel = () => clearInterval(interval);
        },
    });
    return new Response(stream, { headers: sseHeaders() });
}



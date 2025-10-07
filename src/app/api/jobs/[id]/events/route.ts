import { NextRequest } from "next/server";
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

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
            const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
            controller.enqueue(encoder.encode(`: ping\n\n`));
            const unsub = await jobEventsBus.subscribe(id, (row) => send(row));
            (controller as any).onCancel = () => { try { unsub(); } catch { } };
        },
    });
    return new Response(stream, { headers: sseHeaders() });
}



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

export async function GET() {
    const encoder = new TextEncoder();
    let closed = false;
    let lastUpdatedAt: Date | null = null;

    const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
            async function send(json: unknown) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(json)}\n\n`));
            }

            controller.enqueue(encoder.encode(`: ping\n\n`));
            try {
                const items = await prisma.package.findMany({
                    orderBy: { updatedAt: "desc" },
                    include: { scans: { orderBy: { createdAt: "desc" } } },
                    take: 25,
                });
                if (items.length) {
                    lastUpdatedAt = items[0].updatedAt;
                    await send({ type: "snapshot", items });
                }
            } catch (e) {
                console.error("Failed to send snapshot", e);
            }

            const interval = setInterval(async () => {
                if (closed) return;
                try {
                    const where = lastUpdatedAt ? { updatedAt: { gt: lastUpdatedAt } } : {};
                    const fresh = await prisma.package.findMany({
                        where: where as any,
                        orderBy: { updatedAt: "desc" },
                        include: { scans: { orderBy: { createdAt: "desc" } } },
                        take: 50,
                    });
                    if (fresh.length) {
                        lastUpdatedAt = fresh[0].updatedAt;
                        await send({ type: "changed", items: fresh });
                    }
                } catch (e) {
                    console.error("Failed to send changed", e);
                }
            }, 1500);

            const hb = setInterval(() => {
                if (closed) return;
                controller.enqueue(encoder.encode(`: ping\n\n`));
            }, 15000);

            (controller as any).onCancel = () => {
                closed = true;
                clearInterval(interval);
                clearInterval(hb);
            };
        },
        cancel() {
            closed = true;
        },
    });

    return new Response(stream, { headers: sseHeaders() });
}



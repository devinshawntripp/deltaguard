import { NextRequest } from "next/server";
import { ADMIN_OVERRIDE } from "@/lib/roles";
import { requireRequestActor } from "@/lib/authz";
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

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        requiredRoles: [ADMIN_OVERRIDE],
        feature: "stream legacy package events",
    });
    if ("response" in guard) return guard.response;

    const encoder = new TextEncoder();
    let closed = false;
    let pgClient: any = null;

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
                    await send({ type: "snapshot", items });
                }
            } catch (e) {
                console.error("Failed to send snapshot", e);
            }

            // Listen for job_events — when a job changes, packages may have been updated
            try {
                const pg = await import("pg");
                pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
                await pgClient.connect();
                await pgClient.query("LISTEN job_events");

                pgClient.on("notification", async () => {
                    if (closed) return;
                    try {
                        const fresh = await prisma.package.findMany({
                            orderBy: { updatedAt: "desc" },
                            include: { scans: { orderBy: { createdAt: "desc" } } },
                            take: 50,
                        });
                        if (fresh.length) {
                            await send({ type: "changed", items: fresh });
                        }
                    } catch (e) {
                        console.error("Failed to send changed", e);
                    }
                });

                pgClient.on("error", () => {
                    if (!closed) {
                        closed = true;
                        try { controller.close(); } catch { }
                    }
                });
            } catch {
                closed = true;
                try { controller.close(); } catch { }
            }

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

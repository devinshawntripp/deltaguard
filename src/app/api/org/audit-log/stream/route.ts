import { NextRequest } from "next/server";
import { resolveRequestActor, actorHasAnyRole } from "@/lib/authz";
import { ROLE_ORG_OWNER, ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import pg from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return new Response("Unauthorized", { status: 401 });

  const isAdmin = actorHasAnyRole(actor, [ADMIN_OVERRIDE]);
  const isOrgOwner = actorHasAnyRole(actor, [ROLE_ORG_OWNER, ADMIN_OVERRIDE]);
  if (!isOrgOwner) return new Response("Forbidden", { status: 403 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const connStr = process.env.DATABASE_URL || "";
      const client = new pg.Client({ connectionString: connStr });

      client
        .connect()
        .then(() => {
          client.query("LISTEN audit_events");

          client.on("notification", async (msg) => {
            if (!msg.payload) return;
            // payload format: "org_id:action"
            const [eventOrgId] = msg.payload.split(":");

            // Filter: admin sees all, org owner sees only their org
            if (!isAdmin && eventOrgId !== actor.orgId) return;

            try {
              const rows = await prisma.$queryRawUnsafe<
                Array<Record<string, unknown>>
              >(
                `SELECT al.*, u.email as user_email, u.name as user_name
                 FROM audit_log al
                 LEFT JOIN users u ON u.id = al.user_id
                 WHERE al.org_id = $1::uuid
                 ORDER BY al.created_at DESC
                 LIMIT 1`,
                eventOrgId,
              );
              if (rows[0]) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(rows[0])}\n\n`),
                );
              }
            } catch {
              /* ignore query errors */
            }
          });

          // Send keepalive every 30s
          const keepalive = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(": keepalive\n\n"));
            } catch {
              clearInterval(keepalive);
            }
          }, 30000);

          // Cleanup on close
          req.signal.addEventListener("abort", () => {
            clearInterval(keepalive);
            client.end().catch(() => {});
          });
        })
        .catch(() => {
          controller.close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
    },
  });
}

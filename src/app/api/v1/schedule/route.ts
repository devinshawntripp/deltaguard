import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { computeNextRun, isValidCron } from "@/lib/scheduler";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const image = body.image || body.image_ref;
  const cron = body.cron || body.cron_expr || "0 0 * * *";
  const webhookUrl = body.webhook_url || null;
  const mode = body.mode || "light";

  if (!image)
    return NextResponse.json({ error: "image is required" }, { status: 400 });
  if (!isValidCron(cron))
    return NextResponse.json(
      { error: "invalid cron expression" },
      { status: 400 },
    );

  const nextRun = computeNextRun(cron);

  const rows = await prisma.$queryRaw<
    Array<Record<string, unknown>>
  >`
    INSERT INTO scan_schedules (org_id, image_ref, cron_expr, scan_mode, next_run_at)
    VALUES (${actor.orgId}::uuid, ${image}, ${cron}, ${mode}, ${nextRun})
    RETURNING *
  `;

  // If webhook URL provided, create a notification channel
  if (webhookUrl) {
    await prisma.$executeRaw`
      INSERT INTO notification_channels (org_id, channel_type, name, config, enabled)
      VALUES (${actor.orgId}::uuid, 'webhook', ${"Schedule: " + image}, ${JSON.stringify({ url: webhookUrl })}::jsonb, true)
    `;
  }

  audit({
    actor,
    action: "schedule.created",
    targetType: "scan_schedule",
    targetId: rows[0]?.id as string,
    detail: `API schedule for ${image} (${cron})`,
    ip: getClientIp(req),
  });

  return NextResponse.json(
    {
      id: rows[0]?.id,
      image,
      cron,
      mode,
      next_run: nextRun.toISOString(),
      webhook_url: webhookUrl,
    },
    { status: 201 },
  );
}

export async function GET(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.$queryRaw<
    Array<Record<string, unknown>>
  >`
    SELECT id, image_ref, cron_expr, scan_mode, enabled, last_run_at, next_run_at, created_at
    FROM scan_schedules WHERE org_id = ${actor.orgId}::uuid
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ schedules: rows });
}

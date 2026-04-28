import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import { createRegistryJob, getJob } from "@/lib/jobs";
import { getScannerSettings } from "@/lib/scannerSettings";
import { incrementUsage } from "@/lib/usage";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor)
    return NextResponse.json(
      {
        error:
          "unauthorized — provide API key via Authorization: Bearer header",
      },
      { status: 401 },
    );

  const body = await req.json();
  const image = body.image || body.image_ref;
  const mode = body.mode || "light";
  const wait = body.wait === true;

  if (!image) {
    return NextResponse.json({ error: "image is required" }, { status: 400 });
  }

  const settings = await getScannerSettings(actor.orgId);
  const job = await createRegistryJob({
    registry_image: image,
    org_id: actor.orgId,
    created_by_user_id: actor.userId || null,
    created_by_api_key_id: actor.apiKeyId || null,
    settings_snapshot: { ...settings, mode_default: mode as "light" | "deep" },
  });

  await incrementUsage(actor.orgId, actor.kind === "api_key" ? "api" : "ui");
  audit({
    actor,
    action: "scan.created",
    targetType: "scan_job",
    targetId: job.id,
    detail: `API scan for ${image}`,
    ip: getClientIp(req),
  });

  if (!wait) {
    return NextResponse.json(
      {
        job_id: job.id,
        status: "queued",
        image,
        message:
          "Scan queued. Poll GET /api/jobs/{job_id} for status, or use wait=true to block until complete.",
      },
      { status: 202 },
    );
  }

  // Wait mode: poll until done (max 5 minutes)
  const timeout = 300_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const current = await getJob(job.id, actor.orgId);
    if (current?.status === "done") {
      return NextResponse.json({
        job_id: job.id,
        status: "done",
        image,
        summary: current.summary_json,
        report_url: `https://scanrook.io/dashboard/${job.id}`,
      });
    }
    if (current?.status === "failed") {
      return NextResponse.json(
        {
          job_id: job.id,
          status: "failed",
          image,
          error: current.error_msg,
        },
        { status: 422 },
      );
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  return NextResponse.json(
    {
      job_id: job.id,
      status: "timeout",
      image,
      message:
        "Scan still running after 5 minutes. Check GET /api/jobs/" + job.id,
    },
    { status: 202 },
  );
}

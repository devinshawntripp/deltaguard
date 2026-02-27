import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { uploadBufferToS3 } from "@/lib/s3";
import { createJob } from "@/lib/jobs";
import { actorHasAnyRole, forbiddenByRole, JOB_WRITE_ROLES, resolveRequestActor } from "@/lib/authz";
import { canQueueScan, incrementUsage } from "@/lib/usage";
import { getScannerSettings } from "@/lib/scannerSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!actorHasAnyRole(actor, JOB_WRITE_ROLES)) {
    return forbiddenByRole(actor, JOB_WRITE_ROLES, "file upload");
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const settings = await getScannerSettings(actor.orgId);
    const mode = String(form.get("mode") || settings.mode_default || "light");
    const format = String(form.get("format") || "json");
    const refs = String(form.get("refs") || "false").toLowerCase() === "true";

    const bucket = (process.env.UPLOADS_BUCKET || process.env.MINIO_BUCKET || "").trim();
    if (!bucket) {
      return NextResponse.json({ error: "UPLOADS_BUCKET/MINIO_BUCKET not set" }, { status: 500 });
    }

    const quota = await canQueueScan(actor.orgId);
    if (!quota.allowed) {
      return NextResponse.json({ error: "Monthly scan limit reached", code: "quota_exceeded", usage: quota.usage }, { status: 402 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const maxInlineBytes = Number(process.env.INLINE_UPLOAD_MAX_BYTES || `${50 * 1024 * 1024}`);
    if (buffer.byteLength > maxInlineBytes) {
      return NextResponse.json(
        { error: "File too large for multipart API route. Use /api/uploads/presign direct upload." },
        { status: 413 },
      );
    }
    const key = `${Date.now()}_${file.name}`;
    const contentTypeOut = file.type || "application/octet-stream";

    // Queue-first flow: persist upload to S3/MinIO, then enqueue a job for workers.
    await uploadBufferToS3({ bucket, key, buffer, contentType: contentTypeOut });
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const job = await createJob({
      bucket,
      object_key: key,
      mode,
      format,
      refs,
      org_id: actor.orgId,
      created_by_user_id: actor.userId || null,
      created_by_api_key_id: actor.apiKeyId || null,
      settings_snapshot: settings,
    });
    await incrementUsage(actor.orgId, actor.kind === "api_key" ? "api" : "ui");

    return NextResponse.json({
      id: job.id,
      jobId: job.id,
      bucket,
      key,
      sha256,
      queued: true,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

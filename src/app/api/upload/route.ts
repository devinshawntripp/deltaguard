import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { uploadBufferToS3 } from "@/lib/s3";
import { createJob } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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

    const mode = String(form.get("mode") || "light");
    const format = String(form.get("format") || "json");
    const refs = String(form.get("refs") || "false").toLowerCase() === "true";

    const bucket = (process.env.UPLOADS_BUCKET || process.env.MINIO_BUCKET || "").trim();
    if (!bucket) {
      return NextResponse.json({ error: "UPLOADS_BUCKET/MINIO_BUCKET not set" }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${Date.now()}_${file.name}`;
    const contentTypeOut = file.type || "application/octet-stream";

    // Queue-first flow: persist upload to S3/MinIO, then enqueue a job for workers.
    await uploadBufferToS3({ bucket, key, buffer, contentType: contentTypeOut });
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const job = await createJob({ bucket, object_key: key, mode, format, refs });

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

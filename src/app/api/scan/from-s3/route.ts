import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { key, bucket: inBucket, mode, format, refs } = await req.json();
        if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
        const bucket = String(inBucket || process.env.UPLOADS_BUCKET || process.env.MINIO_BUCKET || "").trim();
        if (!bucket) return NextResponse.json({ error: "bucket required or UPLOADS_BUCKET/MINIO_BUCKET not set" }, { status: 500 });

        const job = await createJob({
            bucket,
            object_key: String(key),
            mode: String(mode || "light"),
            format: String(format || "json"),
            refs: Boolean(refs ?? false),
        });
        return NextResponse.json({ id: job.id, jobId: job.id, key, bucket, queued: true });
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

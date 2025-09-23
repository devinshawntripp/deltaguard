import { NextRequest, NextResponse } from "next/server";
import { presignPost } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { filename, contentType } = await req.json();
        if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });
        const bucket = process.env.MINIO_BUCKET as string;
        if (!bucket) return NextResponse.json({ error: "MINIO_BUCKET not set" }, { status: 500 });
        const key = `${Date.now()}_${String(filename)}`;
        const post = await presignPost({ bucket, key, contentType: contentType || "application/octet-stream" });
        return NextResponse.json({ key, url: post.url, fields: post.fields });
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}



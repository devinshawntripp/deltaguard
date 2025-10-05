import { NextRequest, NextResponse } from "next/server";
import { presignPut, presignPost } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { filename, contentType, method } = await req.json();
        if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });
        const bucket = (process.env.UPLOADS_BUCKET || process.env.MINIO_BUCKET) as string;
        if (!bucket) return NextResponse.json({ error: "UPLOADS_BUCKET not set" }, { status: 500 });
        const key = `${Date.now()}_${String(filename)}`;
        if (String(method || "post").toLowerCase() === "put") {
            const put = await presignPut({ bucket, key, contentType: contentType || "application/octet-stream" });
            return NextResponse.json({ key, url: put.url, method: put.method, headers: put.headers, bucket });
        } else {
            const post = await presignPost({ bucket, key, contentType: contentType || "application/octet-stream" });
            return NextResponse.json({ key, url: post.url, method: "POST", fields: post.fields, bucket });
        }
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}



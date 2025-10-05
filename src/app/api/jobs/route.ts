import { NextRequest, NextResponse } from "next/server";
import { createJob, listJobs } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const items = await listJobs(100);
        return NextResponse.json(items);
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const bucket = String(body.bucket || process.env.UPLOADS_BUCKET || "");
        const object_key = String(body.object_key || body.key || "");
        const mode = String(body.mode || "light");
        const format = String(body.format || "json");
        const refs = Boolean(body.refs ?? false);
        if (!bucket || !object_key) return NextResponse.json({ error: "bucket and object_key required" }, { status: 400 });
        const job = await createJob({ bucket, object_key, mode, format, refs });
        return NextResponse.json(job);
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}



import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { presignGet } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const job = await getJob(id);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (!job.report_bucket || !job.report_key) return NextResponse.json({ error: "report not available" }, { status: 400 });
    const url = await presignGet({ bucket: job.report_bucket, key: job.report_key });
    return NextResponse.json(url);
}



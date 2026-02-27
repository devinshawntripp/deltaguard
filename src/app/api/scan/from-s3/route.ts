import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/jobs";
import { actorHasAnyRole, forbiddenByRole, JOB_WRITE_ROLES, resolveRequestActor } from "@/lib/authz";
import { canQueueScan, incrementUsage } from "@/lib/usage";
import { getScannerSettings } from "@/lib/scannerSettings";
import { withRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withRateLimit(async function POST(req: NextRequest) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_WRITE_ROLES)) {
        return forbiddenByRole(actor, JOB_WRITE_ROLES, "queue scan from S3");
    }

    try {
        const { key, bucket: inBucket, mode, format, refs } = await req.json();
        if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
        const bucket = String(inBucket || process.env.UPLOADS_BUCKET || process.env.MINIO_BUCKET || "").trim();
        if (!bucket) return NextResponse.json({ error: "bucket required or UPLOADS_BUCKET/MINIO_BUCKET not set" }, { status: 500 });

        const quota = await canQueueScan(actor.orgId);
        if (!quota.allowed) {
            return NextResponse.json(
                { error: "Monthly scan limit reached", code: "quota_exceeded", usage: quota.usage },
                { status: 402 },
            );
        }

        const settings = await getScannerSettings(actor.orgId);
        const job = await createJob({
            bucket,
            object_key: String(key),
            mode: String(mode || settings.mode_default || "light"),
            format: String(format || "json"),
            refs: Boolean(refs ?? false),
            org_id: actor.orgId,
            created_by_user_id: actor.userId || null,
            created_by_api_key_id: actor.apiKeyId || null,
            settings_snapshot: settings,
        });
        await incrementUsage(actor.orgId, actor.kind === "api_key" ? "api" : "ui");
        return NextResponse.json({ id: job.id, jobId: job.id, key, bucket, queued: true });
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}, { maxRequests: 60, windowSeconds: 60 });

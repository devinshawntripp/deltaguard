import { NextRequest, NextResponse } from "next/server";
import { createJob, listJobs } from "@/lib/jobs";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, JOB_WRITE_ROLES, resolveRequestActor } from "@/lib/authz";
import { canQueueScan, incrementUsage } from "@/lib/usage";
import { getScannerSettings } from "@/lib/scannerSettings";
import { withRateLimit } from "@/lib/rateLimit";
import { ADMIN_OVERRIDE } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "list jobs");
    }

    try {
        const items = await listJobs(100, actor.orgId);
        return NextResponse.json(items);
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

export const POST = withRateLimit(async function POST(req: NextRequest) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_WRITE_ROLES)) {
        return forbiddenByRole(actor, JOB_WRITE_ROLES, "create job");
    }

    try {
        const body = await req.json();
        const bucket = String(body.bucket || process.env.UPLOADS_BUCKET || "");
        const object_key = String(body.object_key || body.key || "");
        const settings = await getScannerSettings(actor.orgId);
        const mode = String(body.mode || settings.mode_default || "light");
        const format = String(body.format || "json");
        const refs = Boolean(body.refs ?? false);
        if (!bucket || !object_key) return NextResponse.json({ error: "bucket and object_key required" }, { status: 400 });

        const isAdmin = actor.rolesMask === ADMIN_OVERRIDE;
        const quota = await canQueueScan(actor.orgId);
        if (!quota.allowed && !isAdmin) {
            return NextResponse.json(
                {
                    error: "Monthly scan limit reached",
                    code: "quota_exceeded",
                    usage: quota.usage,
                },
                { status: 402 },
            );
        }

        const job = await createJob({
            bucket,
            object_key,
            mode,
            format,
            refs,
            org_id: actor.orgId,
            created_by_user_id: actor.userId || null,
            created_by_api_key_id: actor.apiKeyId || null,
            settings_snapshot: settings,
        });
        await incrementUsage(actor.orgId, actor.kind === "api_key" ? "api" : "ui");
        return NextResponse.json(job);
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}, { maxRequests: 60, windowSeconds: 60 });

import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { presignGet } from "@/lib/s3";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "view SBOM diff");
    }

    const { id } = await context.params;
    const job = await getJob(id, actor.orgId);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

    if (!job.sbom_diff_summary) {
        return NextResponse.json({ error: "No diff available" }, { status: 404 });
    }

    if (!job.report_bucket || !job.report_key) {
        return NextResponse.json({ error: "report not available" }, { status: 400 });
    }

    const diffKey = job.report_key.replace(/\.json$/, ".sbom-diff.json");
    const { url } = await presignGet({ bucket: job.report_bucket, key: diffKey });

    return NextResponse.json({
        summary: job.sbom_diff_summary,
        full_diff_url: url,
    });
}

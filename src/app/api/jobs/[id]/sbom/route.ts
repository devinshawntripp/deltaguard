import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { presignGet } from "@/lib/s3";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMAT_MAP: Record<string, string> = {
    cyclonedx: "sbom.cdx.json",
    spdx: "sbom.spdx.json",
    syft: "sbom.syft.json",
};

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "download SBOM");
    }

    const { id } = await context.params;
    const format = req.nextUrl.searchParams.get("format") || "cyclonedx";
    const ext = FORMAT_MAP[format];
    if (!ext) {
        return NextResponse.json({ error: "Invalid format. Use: cyclonedx, spdx, syft" }, { status: 400 });
    }

    const job = await getJob(id, actor.orgId);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (!job.report_bucket || !job.report_key) {
        return NextResponse.json({ error: "report not available" }, { status: 400 });
    }
    if (job.sbom_status !== "ready") {
        return NextResponse.json({ error: "SBOMs not ready yet", sbom_status: job.sbom_status }, { status: 409 });
    }

    // Build SBOM S3 key from report key: "reports/<id>.json" → "reports/<id>.sbom.cdx.json"
    const sbomKey = job.report_key.replace(/\.json$/, `.${ext}`);

    const { url } = await presignGet({ bucket: job.report_bucket, key: sbomKey });
    return NextResponse.json({ url, format, filename: `${id}.${ext}` });
}

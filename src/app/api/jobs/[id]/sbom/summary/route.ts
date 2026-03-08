import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "view SBOM summary");
    }

    const { id } = await context.params;
    const job = await getJob(id, actor.orgId);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

    try {
        const rows = await prisma.$queryRawUnsafe<Array<{ ecosystem: string; count: number }>>(
            `SELECT ecosystem, COUNT(*)::int AS count
             FROM scan_packages WHERE job_id = $1::uuid
             GROUP BY ecosystem ORDER BY count DESC`,
            id,
        );

        const totalRows = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
            `SELECT COUNT(*)::int AS total FROM scan_packages WHERE job_id = $1::uuid`,
            id,
        );

        const ecosystems: Record<string, number> = {};
        for (const r of rows) {
            ecosystems[r.ecosystem] = r.count;
        }

        return NextResponse.json({
            total_packages: totalRows[0]?.total || 0,
            ecosystems,
        });
    } catch (err: unknown) {
        const msg = String(err instanceof Error ? err.message : err);
        // Fall back gracefully if scan_packages table doesn't exist yet
        if (/scan_packages|42P01/i.test(msg)) {
            return NextResponse.json({ total_packages: 0, ecosystems: {} });
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

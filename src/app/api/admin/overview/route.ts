import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OverviewResponse = {
  totals: {
    orgs: number;
    users: number;
    memberships: number;
    api_keys_active: number;
    jobs_total: number;
    jobs_queued: number;
    jobs_running: number;
    jobs_done: number;
    jobs_failed: number;
  };
  orgs: Array<{
    id: string;
    name: string;
    slug: string;
    members: number;
    jobs: number;
  }>;
};

export async function GET(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.rolesMask !== ADMIN_OVERRIDE) {
    return NextResponse.json(
      {
        error: "master admin only",
        code: "forbidden_role",
      },
      { status: 403 },
    );
  }

  const totalsRows = await prisma.$queryRaw<Array<OverviewResponse["totals"]>>`
SELECT
  (SELECT COUNT(*)::int FROM orgs) AS orgs,
  (SELECT COUNT(*)::int FROM users) AS users,
  (SELECT COUNT(*)::int FROM org_memberships) AS memberships,
  (SELECT COUNT(*)::int FROM api_keys WHERE status='active') AS api_keys_active,
  (SELECT COUNT(*)::int FROM scan_jobs) AS jobs_total,
  (SELECT COUNT(*)::int FROM scan_jobs WHERE status='queued') AS jobs_queued,
  (SELECT COUNT(*)::int FROM scan_jobs WHERE status='running') AS jobs_running,
  (SELECT COUNT(*)::int FROM scan_jobs WHERE status='done') AS jobs_done,
  (SELECT COUNT(*)::int FROM scan_jobs WHERE status='failed') AS jobs_failed
  `;

  const orgRows = await prisma.$queryRaw<OverviewResponse["orgs"]>`
SELECT
  o.id::text AS id,
  o.name,
  o.slug,
  COALESCE(m.cnt, 0)::int AS members,
  COALESCE(j.cnt, 0)::int AS jobs
FROM orgs o
LEFT JOIN (
  SELECT org_id, COUNT(*) AS cnt
  FROM org_memberships
  WHERE status='active'
  GROUP BY org_id
) m ON m.org_id = o.id
LEFT JOIN (
  SELECT org_id, COUNT(*) AS cnt
  FROM scan_jobs
  GROUP BY org_id
) j ON j.org_id = o.id
ORDER BY o.created_at ASC
  `;

  return NextResponse.json({
    totals: totalsRows[0] || {
      orgs: 0,
      users: 0,
      memberships: 0,
      api_keys_active: 0,
      jobs_total: 0,
      jobs_queued: 0,
      jobs_running: 0,
      jobs_done: 0,
      jobs_failed: 0,
    },
    orgs: orgRows,
  } satisfies OverviewResponse);
}

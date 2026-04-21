import { prisma } from "@/lib/prisma";

export type ContributorActivity = {
  user_id: string;
  email: string;
  name: string | null;
  scan_count: number;
  last_scan_at: string;
  source: string; // "ui" | "api" | "ui+api"
};

/**
 * Count unique active contributors in the last N days.
 * A contributor is a user who triggered at least one scan (directly or via API key).
 * Scheduled/automated scans don't count (created_by_user_id is null).
 */
export async function getActiveContributors(
  orgId: string,
  days: number = 90,
): Promise<{ count: number; contributors: ContributorActivity[] }> {
  const rows = await prisma.$queryRaw<ContributorActivity[]>`
    SELECT 
      u.id::text as user_id,
      u.email,
      u.name,
      COUNT(j.id)::int as scan_count,
      MAX(j.created_at)::text as last_scan_at,
      CASE 
        WHEN j.created_by_api_key_id IS NOT NULL THEN 'api'
        ELSE 'ui'
      END as source
    FROM scan_jobs j
    JOIN users u ON u.id = j.created_by_user_id
    WHERE j.org_id = ${orgId}::uuid
      AND j.created_at >= NOW() - make_interval(days => ${days})
      AND j.created_by_user_id IS NOT NULL
    GROUP BY u.id, u.email, u.name, 
      CASE WHEN j.created_by_api_key_id IS NOT NULL THEN 'api' ELSE 'ui' END
    ORDER BY scan_count DESC
  `;

  // Deduplicate by user_id (a user might appear twice if they used both UI and API)
  const uniqueUsers = new Map<string, ContributorActivity>();
  for (const row of rows) {
    const existing = uniqueUsers.get(row.user_id);
    if (existing) {
      existing.scan_count += row.scan_count;
      if (row.last_scan_at > existing.last_scan_at) {
        existing.last_scan_at = row.last_scan_at;
      }
      existing.source = "ui+api";
    } else {
      uniqueUsers.set(row.user_id, { ...row });
    }
  }

  const contributors = Array.from(uniqueUsers.values());
  return { count: contributors.length, contributors };
}

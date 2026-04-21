import { prisma } from "@/lib/prisma";

export type ContributorActivity = {
  user_id: string;
  email: string;
  name: string | null;
  scan_count: number;
  last_scan_at: string;
  source: string; // "ui" | "api" | "cli" | "ui+api"
};

/**
 * Count unique active contributors in the last N days.
 *
 * A contributor is any user who triggered a scan, either:
 *   1. Directly via UI (created_by_user_id is set)
 *   2. Via an API key they created (traces key back to its creator)
 *
 * This matches the Snyk/Semgrep model: API keys are attributed to the
 * person who created them, so CI/CD scans count toward that user's activity.
 *
 * Scheduled/automated scans (created_by_user_id IS NULL and key has no
 * creator) don't count — they're org-level automation, not a person.
 */
export async function getActiveContributors(
  orgId: string,
  days: number = 90,
): Promise<{ count: number; contributors: ContributorActivity[] }> {
  // Query 1: Direct UI/CLI scans (user authenticated directly)
  const directRows = await prisma.$queryRaw<ContributorActivity[]>`
    SELECT
      u.id::text as user_id,
      u.email,
      u.name,
      COUNT(j.id)::int as scan_count,
      MAX(j.created_at)::text as last_scan_at,
      'ui' as source
    FROM scan_jobs j
    JOIN users u ON u.id = j.created_by_user_id
    WHERE j.org_id = ${orgId}::uuid
      AND j.created_at >= NOW() - make_interval(days => ${days}::int)
      AND j.created_by_user_id IS NOT NULL
      AND j.created_by_api_key_id IS NULL
    GROUP BY u.id, u.email, u.name
  `;

  // Query 2: API key scans — trace key back to its creator (Snyk model)
  const apiRows = await prisma.$queryRaw<ContributorActivity[]>`
    SELECT
      u.id::text as user_id,
      u.email,
      u.name,
      COUNT(j.id)::int as scan_count,
      MAX(j.created_at)::text as last_scan_at,
      'api' as source
    FROM scan_jobs j
    JOIN api_keys ak ON ak.id = j.created_by_api_key_id
    JOIN users u ON u.id = ak.created_by
    WHERE j.org_id = ${orgId}::uuid
      AND j.created_at >= NOW() - make_interval(days => ${days}::int)
      AND j.created_by_api_key_id IS NOT NULL
      AND ak.created_by IS NOT NULL
    GROUP BY u.id, u.email, u.name
  `;

  // Merge both sources, dedup by user_id
  const uniqueUsers = new Map<string, ContributorActivity>();

  for (const row of directRows) {
    uniqueUsers.set(row.user_id, { ...row });
  }

  for (const row of apiRows) {
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

  const contributors = Array.from(uniqueUsers.values())
    .sort((a, b) => b.scan_count - a.scan_count);

  return { count: contributors.length, contributors };
}

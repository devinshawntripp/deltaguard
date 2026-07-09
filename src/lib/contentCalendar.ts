import { prisma } from "@/lib/prisma";
import { posts } from "@/lib/blogPosts";
import { isPublished } from "@/lib/publishGate";

export type CalendarStatus = "published" | "queued" | "drafting";

export type CalendarEntry = {
  slug: string;
  keyword: string;
  difficulty: number | null;
  monthly_volume: number | null;
  status_override: string | null;
  updated_at: string;
  title: string | null;
  publish_date: string | null;
  status: CalendarStatus;
};

export type CalendarMetaPatch = {
  keyword?: string;
  difficulty?: number | null;
  monthly_volume?: number | null;
  status_override?: string | null;
};

type MetaRow = {
  slug: string;
  keyword: string;
  difficulty: number | null;
  monthly_volume: number | null;
  status_override: string | null;
  updated_at: string;
};

/* Seed data for the 50-article drip campaign (July + August 2026).
   Keywords come from the campaign design doc Section 2; KD / monthly
   volume are the initial keyword-research estimates. */
const SEED: Array<[slug: string, keyword: string, kd: number, vol: number]> = [
  ["is-nginx-docker-image-safe", "is nginx docker image safe", 22, 70],
  ["is-postgres-docker-image-safe", "is postgres docker image safe", 20, 50],
  ["is-redis-docker-image-safe", "is redis docker image safe", 18, 40],
  ["is-node-docker-image-safe", "is node docker image safe", 24, 90],
  ["is-python-docker-image-safe", "is python docker image safe", 25, 90],
  ["is-alpine-docker-image-safe", "is alpine docker image safe", 26, 110],
  ["is-ubuntu-docker-image-safe", "is ubuntu docker image safe", 24, 70],
  ["is-mysql-docker-image-safe", "is mysql docker image safe", 21, 50],
  ["is-mongo-docker-image-safe", "is mongo docker image safe", 20, 40],
  ["is-httpd-docker-image-safe", "is httpd docker image safe", 15, 30],
  ["is-php-docker-image-safe", "is php docker image safe", 19, 40],
  ["is-golang-docker-image-safe", "is golang docker image safe", 18, 30],
  ["is-openjdk-docker-image-safe", "is openjdk docker image safe", 17, 40],
  ["is-rabbitmq-docker-image-safe", "is rabbitmq docker image safe", 14, 20],
  ["is-memcached-docker-image-safe", "is memcached docker image safe", 10, 10],
  ["is-busybox-docker-image-safe", "is busybox docker image safe", 12, 20],
  ["is-traefik-docker-image-safe", "is traefik docker image safe", 13, 20],
  ["is-wordpress-docker-image-safe", "is wordpress docker image safe", 28, 90],
  ["is-elasticsearch-docker-image-safe", "is elasticsearch docker image safe", 16, 30],
  ["is-grafana-docker-image-safe", "is grafana docker image safe", 14, 20],
  ["how-to-reduce-cves-in-docker-images", "reduce CVEs docker image", 35, 320],
  ["how-to-patch-docker-base-image-vulnerabilities", "patch docker base image", 28, 140],
  ["multi-stage-docker-builds-security", "multi-stage build security", 32, 260],
  ["migrating-to-distroless-images", "distroless migration", 38, 480],
  ["how-to-handle-unfixable-cves", "unfixable CVEs / no fix available", 22, 90],
  ["docker-image-hardening-checklist", "docker image hardening", 34, 390],
  ["automate-docker-base-image-updates", "auto update base images", 26, 110],
  ["fix-npm-vulnerabilities-in-docker", "npm audit docker", 30, 210],
  ["minimal-docker-images-guide", "minimal docker image", 33, 480],
  ["how-to-triage-vulnerability-scan-results", "vulnerability triage", 27, 170],
  ["scan-docker-images-github-actions", "github actions docker scan", 42, 720],
  ["scan-docker-images-gitlab-ci", "gitlab ci container scanning", 38, 480],
  ["jenkins-container-scanning", "jenkins docker image scan", 36, 390],
  ["circleci-container-scanning", "circleci vulnerability scan", 24, 90],
  ["argocd-gitops-image-scanning", "argocd image scanning", 26, 140],
  ["kubernetes-admission-control-image-scanning", "k8s admission controller scanning", 31, 210],
  ["pre-commit-vulnerability-scanning", "pre-commit security scan", 23, 110],
  ["scan-images-on-registry-push", "registry scan on push", 21, 70],
  ["grype-alternatives", "grype alternative", 24, 90],
  ["docker-scout-alternatives", "docker scout alternative", 27, 140],
  ["snyk-vs-open-source-scanners", "snyk vs trivy/grype", 29, 90],
  ["osv-vs-nvd", "osv vs nvd", 18, 70],
  ["best-container-vulnerability-scanners-2026", "best container scanner 2026", 47, 880],
  ["sbom-requirements-2026", "SBOM requirements", 36, 480],
  ["eu-cyber-resilience-act-containers", "EU CRA compliance containers", 39, 720],
  ["cyclonedx-vs-spdx", "cyclonedx vs spdx", 28, 320],
  ["sbom-generation-in-ci", "generate SBOM in CI", 25, 170],
  ["vex-explained", "what is VEX", 31, 590],
  ["nvd-backlog-explained", "NVD backlog", 21, 90],
  ["trivy-alternatives", "trivy alternative", 33, 260],
  ["what-is-a-cbom", "what is a CBOM", 19, 210],
];

/* Lazily ensure the table exists + is seeded, once per process.
   Never runs at module import time — only inside request handlers. */
let schemaReady: Promise<void> | null = null;

async function initSchema(): Promise<void> {
  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS content_calendar_meta (
  slug TEXT PRIMARY KEY,
  keyword TEXT NOT NULL DEFAULT '',
  difficulty INT,
  monthly_volume INT,
  status_override TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
  `);

  const countRows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    `SELECT COUNT(*)::int AS count FROM content_calendar_meta`,
  );
  const count = countRows[0]?.count ?? 0;
  if (count > 0) return;

  const values: string[] = [];
  const params: Array<string | number> = [];
  SEED.forEach(([slug, keyword, kd, vol], i) => {
    const base = i * 4;
    values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
    params.push(slug, keyword, kd, vol);
  });
  await prisma.$executeRawUnsafe(
    `INSERT INTO content_calendar_meta (slug, keyword, difficulty, monthly_volume)
VALUES ${values.join(", ")}
ON CONFLICT (slug) DO NOTHING`,
    ...params,
  );
}

function ensureContentCalendarSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = initSchema().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

function registryBySlug(): Map<string, { title: string; publishDate: string | null }> {
  const map = new Map<string, { title: string; publishDate: string | null }>();
  for (const post of posts) {
    const slug = post.href.replace(/^\/blog\//, "");
    map.set(slug, { title: post.title, publishDate: post.publishDate || null });
  }
  return map;
}

function deriveStatus(
  hasRegistryEntry: boolean,
  publishDate: string | null,
  statusOverride: string | null,
): CalendarStatus {
  if (statusOverride === "drafting") return "drafting";
  if (!hasRegistryEntry) return "drafting";
  // Single source of truth: the same gate that controls live blog visibility.
  return isPublished({ publishDate: publishDate ?? undefined }) ? "published" : "queued";
}

function toEntry(
  row: MetaRow,
  registry: Map<string, { title: string; publishDate: string | null }>,
): CalendarEntry {
  const reg = registry.get(row.slug);
  return {
    slug: row.slug,
    keyword: row.keyword,
    difficulty: row.difficulty,
    monthly_volume: row.monthly_volume,
    status_override: row.status_override,
    updated_at: row.updated_at,
    title: reg?.title ?? null,
    publish_date: reg?.publishDate ?? null,
    status: deriveStatus(!!reg, reg?.publishDate ?? null, row.status_override),
  };
}

const META_SELECT = `
SELECT
  slug,
  keyword,
  difficulty,
  monthly_volume,
  status_override,
  updated_at::text AS updated_at
FROM content_calendar_meta
`;

export async function getCalendarData(): Promise<CalendarEntry[]> {
  await ensureContentCalendarSchema();
  const rows = await prisma.$queryRawUnsafe<MetaRow[]>(`${META_SELECT} ORDER BY slug`);
  const registry = registryBySlug();
  return rows.map((row) => toEntry(row, registry));
}

export async function upsertMeta(
  slug: string,
  patch: CalendarMetaPatch,
): Promise<CalendarEntry | null> {
  await ensureContentCalendarSchema();
  await prisma.$executeRawUnsafe(
    `INSERT INTO content_calendar_meta (slug, keyword, difficulty, monthly_volume, status_override, updated_at)
VALUES ($1, COALESCE($2, ''), $3, $4, $5, now())
ON CONFLICT (slug) DO UPDATE SET
  keyword = COALESCE($2, content_calendar_meta.keyword),
  difficulty = COALESCE($3, content_calendar_meta.difficulty),
  monthly_volume = COALESCE($4, content_calendar_meta.monthly_volume),
  status_override = COALESCE($5, content_calendar_meta.status_override),
  updated_at = now()`,
    slug,
    patch.keyword ?? null,
    patch.difficulty ?? null,
    patch.monthly_volume ?? null,
    patch.status_override ?? null,
  );
  const rows = await prisma.$queryRawUnsafe<MetaRow[]>(`${META_SELECT} WHERE slug = $1 LIMIT 1`, slug);
  if (!rows[0]) return null;
  return toEntry(rows[0], registryBySlug());
}

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

/* Seed data for the blog drip campaign (63 articles). Keyword, KD, and
   monthly search volume are real keyword-research values (see
   docs/plans/blog-keyword-data.json), not estimates. */
const SEED: Array<[slug: string, keyword: string, kd: number, vol: number]> = [
  ["is-nginx-docker-image-safe", "is nginx docker image safe", 22, 0],
  ["is-postgres-docker-image-safe", "is postgres docker image safe", 20, 0],
  ["is-redis-docker-image-safe", "is redis docker image safe", 18, 0],
  ["is-node-docker-image-safe", "is node docker image safe", 24, 0],
  ["is-python-docker-image-safe", "is python docker image safe", 25, 0],
  ["how-to-reduce-cves-in-docker-images", "docker cve", 16, 70],
  ["how-to-patch-docker-base-image-vulnerabilities", "patch docker base image", 28, 0],
  ["multi-stage-docker-builds-security", "docker multi stage build", 9, 390],
  ["migrating-to-distroless-images", "distroless", 17, 480],
  ["docker-image-hardening-checklist", "docker image hardening", 20, 50],
  ["automate-docker-base-image-updates", "renovate docker", 30, 70],
  ["fix-npm-vulnerabilities-in-docker", "npm audit fix", 15, 880],
  ["minimal-docker-images-guide", "minimal docker image", 24, 30],
  ["how-to-triage-vulnerability-scan-results", "vulnerability triage", 27, 20],
  ["scan-docker-images-github-actions", "trivy github actions", 29, 110],
  ["scan-docker-images-gitlab-ci", "gitlab ci container scanning", 38, 10],
  ["jenkins-container-scanning", "jenkins security scan", 3, 50],
  ["kubernetes-admission-control-image-scanning", "kyverno", 22, 1900],
  ["grype-alternatives", "grype scanner", 5, 170],
  ["snyk-vs-open-source-scanners", "snyk alternative", 0, 110],
  ["osv-vs-nvd", "osv scanner", 40, 390],
  ["best-container-vulnerability-scanners-2026", "container security tools", 2, 480],
  ["sbom-requirements-2026", "SBOM requirements", 28, 40],
  ["eu-cyber-resilience-act-containers", "cyber resilience act", 30, 1000],
  ["cyclonedx-vs-spdx", "cyclonedx vs spdx", 0, 50],
  ["sbom-generation-in-ci", "syft sbom", 7, 260],
  ["vex-explained", "what is VEX", 16, 480],
  ["nvd-backlog-explained", "NVD backlog", 21, 10],
  ["trivy-alternatives", "trivy alternative", 33, 50],
  ["what-is-a-cbom", "what is a CBOM", 0, 50],
  ["npm-audit-explained", "npm audit", 27, 1000],
  ["owasp-dependency-check-alternatives", "owasp dependency check", 48, 720],
  ["software-supply-chain-security", "supply chain security", 18, 590],
  ["sigstore-cosign-container-signing", "image signing", 0, 320],
  ["pip-audit-python-dependency-scanning", "pip audit", 0, 390],
  ["govulncheck-go-vulnerability-scanning", "govulncheck", 20, 320],
  ["cvss-4-0-explained", "cvss 4.0", 24, 260],
  ["cargo-audit-rust-dependency-scanning", "cargo audit", 12, 170],
  ["container-image-scanning-guide", "container image scanning", 0, 170],
  ["docker-vulnerability-scanner-guide", "docker vulnerability scanner", 0, 140],
  ["slsa-framework-explained", "slsa framework", 27, 110],
  ["kubernetes-vulnerability-scanning-guide", "kubernetes vulnerability scanning", 0, 110],
  ["shellshock-cve-2014-6271", "shellshock", 51, 74000],
  ["falco-runtime-security-explained", "falco", 47, 27100],
  ["github-security-advisories-explained", "ghsa", 35, 18100],
  ["what-is-a-zero-day-vulnerability", "zero day vulnerability", 24, 5400],
  ["cis-benchmarks-explained", "cis benchmark", 36, 3600],
  ["trufflehog-secret-scanning", "trufflehog", 15, 2900],
  ["what-is-a-vulnerability", "what is a vulnerability", 36, 2900],
  ["vulnerability-management-guide", "vulnerability management", 30, 2400],
  ["what-is-software-composition-analysis", "what is sca", 30, 1900],
  ["gitleaks-secret-scanning", "gitleaks", 7, 1600],
  ["ubuntu-vs-debian-docker-base-image", "ubuntu vs debian", 0, 1300],
  ["sast-vs-dast-explained", "sast vs dast", 1, 1000],
  ["anchore-alternatives", "anchore", 13, 1000],
  ["patch-management-guide", "patch management", 26, 1000],
  ["heartbleed-cve-2014-0160", "heartbleed", 30, 880],
  ["kubernetes-secrets-security", "kubernetes secrets", 6, 720],
  ["docker-security-guide", "docker security", 15, 390],
  ["docker-rootless-mode", "docker rootless", 2, 260],
  ["nvd-api-key-guide", "nvd api key", 2, 260],
  ["kube-bench-cis-scanning", "kube-bench", 6, 260],
  ["secret-scanning-guide", "secret scanning", 6, 260],
  ["trivy-operator-kubernetes", "trivy operator", 0, 140],
  ["leaky-vessels-cve-2024-21626", "leaky vessels", 2, 140],
  ["pod-security-standards-guide", "pod security standards", 7, 110],
  ["trivy-vs-grype", "trivy vs grype", 0, 50],
  ["alpine-vs-ubuntu-docker", "alpine vs ubuntu", 0, 50],
  ["pod-security-admission-guide", "pod security admission", 4, 50],
  ["tekton", "tekton", 6, 33100],
  ["indicators-of-compromise", "indicators of compromise", 32, 14800],
  ["clair", "clair", 4, 12100],
  ["nist-800-53", "nist 800-53", 19, 9900],
  ["wazuh", "wazuh", 30, 9900],
  ["semgrep", "semgrep", 25, 8100],
  ["mitre-attack", "mitre att&ck", 25, 6600],
  ["vulnerability-scanning", "vulnerability scanning", 20, 4400],
  ["checkov", "checkov", 23, 4400],
  ["typosquatting", "typosquatting", 12, 3600],
  ["cis-controls", "cis controls", 22, 3600],
  ["cyber-kill-chain", "cyber kill chain", 23, 3600],
  ["dependabot", "dependabot", 31, 3600],
  ["defense-in-depth", "defense in depth", 36, 2900],
  ["eternalblue", "eternalblue", 31, 2400],
  ["in-toto", "in-toto", 14, 1900],
  ["osquery", "osquery", 11, 1600],
  ["remediation-vs-mitigation", "remediation vs mitigation", 6, 1300],
  ["external-secrets-operator", "external secrets operator", 13, 1300],
  ["iast", "iast", 1, 880],
  ["git-secrets", "git secrets", 19, 1300],
  ["image-scanning", "image scanning", 32, 1600],
  ["github-advanced-security", "github advanced security", 34, 1600],
  ["openscap", "openscap", 11, 1000],
  ["cvss-calculator", "cvss calculator", 38, 1600],
  ["attack-surface-management", "attack surface management", 6, 720],
  ["kubernetes-network-policies", "kubernetes network policies", 3, 590],
  ["security-posture", "security posture", 17, 880],
  ["jfrog-xray", "jfrog xray", 8, 590],
  ["dora-compliance", "dora compliance", 17, 720],
  ["license-compliance", "license compliance", 4, 390],
  ["cve-vs-cwe", "cve vs cwe", 0, 260],
  ["drone-ci", "drone ci", 3, 320],
  ["shift-left-security", "shift left security", 6, 390],
  ["docker-socket", "docker socket", 2, 260],
  ["sca-tools", "sca tools", 11, 480],
  ["kics", "kics", 28, 880],
  ["harbor-registry", "harbor registry", 11, 390],
  ["container-runtime-security", "container runtime security", 0, 110],
  ["reachability-analysis", "reachability analysis", 0, 110],
  ["sealed-secrets", "sealed secrets", 6, 260],
  ["nist-800-190", "nist 800-190", 0, 90],
  ["bluekeep", "bluekeep", 5, 210],
  ["ripple20", "ripple20", 0, 70],
  ["security-context-kubernetes", "security context kubernetes", 8, 260],
  ["software-provenance", "software provenance", 0, 50],
  ["yarn-audit", "yarn audit", 7, 170],
  ["dependency-confusion", "dependency confusion", 5, 90],
  ["container-scanning-tools", "container scanning tools", 12, 260],
  ["terrascan", "terrascan", 15, 320],
  ["ecr-image-scanning", "ecr image scanning", 5, 50],
  ["gitlab-container-scanning", "gitlab container scanning", 9, 140],
  ["aws-inspector", "aws inspector", 0, 1600],
  ["mtls-mutual-tls", "mtls", 15, 5400],
  ["nikto-web-scanner", "nikto", 17, 4400],
  ["disa-stig", "disa stig", 22, 4400],
  ["brakeman-rails-security", "brakeman", 11, 2900],
  ["aws-guardduty", "aws guardduty", 3, 2400],
  ["fips-140-2", "fips 140-2", 22, 2400],
  ["tetragon", "tetragon", 27, 2900],
  ["kustomize-security", "kustomize", 24, 1900],
  ["skopeo", "skopeo", 2, 1600],
  ["open-policy-agent", "open policy agent", 5, 1600],
  ["yara-rules", "yara rules", 25, 1300],
  ["buildah", "buildah", 18, 880],
  ["sigma-rules", "sigma rules", 21, 880],
  ["dependency-track", "dependency track", 11, 720],
  ["buildkit-security", "buildkit", 21, 720],
  ["policy-as-code", "policy as code", 11, 590],
  ["dirty-cow", "dirty cow", 8, 480],
  ["owasp-asvs", "owasp asvs", 12, 480],
  ["flux-cd-security", "flux cd", 18, 480],
  ["docker-scout", "docker scout", 17, 390],
  ["spotbugs", "spotbugs", 14, 320],
  ["sbom-tools", "sbom tools", 11, 320],
  ["artifact-registry", "artifact registry", 20, 320],
  ["kubernetes-rbac", "kubernetes rbac", 16, 320],
  ["printnightmare", "printnightmare", 22, 320],
  ["kubescape", "kubescape", 20, 260],
  ["opa-gatekeeper", "opa gatekeeper", 14, 260],
  ["dirty-pipe", "dirty pipe", 22, 260],
  ["nuclei-scanner", "nuclei scanner", 3, 260],
  ["mitre-d3fend", "mitre d3fend", 6, 260],
  ["kev-catalog", "kev catalog", 17, 260],
  ["bandit-python", "bandit python", 12, 210],
  ["gosec", "gosec", 9, 210],
  ["immutable-infrastructure", "immutable infrastructure", 7, 210],
  ["cilium-network-policy", "cilium network policy", 8, 210],
  ["dockerfile-best-practices", "dockerfile best practices", 22, 170],
  ["kubernetes-security-best-practices", "kubernetes security best practices", 19, 170],
  ["pwnkit", "pwnkit", 18, 170],
  ["follina", "follina", 13, 140],
  ["sops-secrets", "sops secrets", 16, 140],
  ["aks-security", "aks security", 0, 170],
  ["private-registry-security", "private registry", 22, 110],
  ["cve-numbering-authority", "cve numbering authority", 21, 70],
  ["vulnerability-prioritization", "vulnerability prioritization", 0, 140],
  ["github-actions-security", "github actions security", 23, 70],
  ["continuous-compliance", "continuous compliance", 0, 140],
  ["helm-security", "helm security", 0, 140],
  ["container-escape", "container escape", 4, 90],
  ["ebpf-security", "ebpf security", 20, 50],
  ["image-promotion", "image promotion", 0, 90],
  ["secret-rotation", "secret rotation", 6, 70],
  ["image-pull-secrets", "image pull secrets", 11, 70],
  ["ci-cd-security-best-practices", "ci cd security best practices", 9, 70],
  ["red-hat-security-advisories", "red hat security advisories", 13, 50],
  ["bundler-audit", "bundler audit", 0, 50],
  ["lambda-security", "lambda security", 0, 50],
  ["kubernetes-admission-controller", "admission controller kubernetes", 1, 50],
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

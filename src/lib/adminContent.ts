export const ADMIN_CONTENT_KEYS = {
  SALES_DEMO_SCRIPT: "sales_demo_script_v1",
  BETA_LAUNCH_PLAN: "beta_launch_plan_v1",
  TARGET_LIST_PLAYBOOK: "target_list_playbook_v1",
  TECH_POSTING_CHANNELS: "tech_posting_channels_v1",
  NAMING_SCORECARD_SEO: "naming_scorecard_seo_v1",
  REBRAND_DOMAIN_SHORTLIST: "rebrand_domain_shortlist_v1",
} as const;

type AdminContentKey = (typeof ADMIN_CONTENT_KEYS)[keyof typeof ADMIN_CONTENT_KEYS];

const SALES_DEMO_SCRIPT_V1 = `# 20-minute Enterprise Demo Script

1. \`0:00-2:00\` Problem framing
   - Most scanners over-report and miss applicability context.
   - ScanRook prioritizes installed-state accuracy, workflow visibility, and actionable fixes.
2. \`2:00-5:00\` Upload and queue
   - Show upload flow, presigned path, queued -> running transition, worker pickup.
3. \`5:00-9:00\` Workflow transparency
   - Open workflow view and show stages, live events, and final terminal state (\`done\`/\`failed\`).
4. \`9:00-13:00\` Findings triage
   - Filter by severity, confidence tier, package/version, fixed/fixed_in, and evidence source.
   - Explain confirmed vs heuristic rows.
5. \`13:00-15:00\` Red Hat applicability
   - Show RHSA-linked finding with package version context and remediation recommendation.
   - Clarify out-of-support and will-not-fix messaging.
6. \`15:00-17:00\` Org controls + API keys
   - Show org roles, API key creation, and API usage docs/Swagger.
7. \`17:00-19:00\` Compliance evidence
   - Show report traceability (raw S3 artifact + DB-backed paginated findings/files).
8. \`19:00-20:00\` Close
   - Pilot success metric: first scan in <24h, triage completion, and policy-ready report export.

## Discovery questions for every demo
1. Which artifact types matter most: container tar, ISO, binaries, or mixed?
2. Do you optimize for CI gate speed, audit quality, or both?
3. What's your false-positive tolerance and SLA for triage?
4. Who signs off: DevSecOps owner, compliance owner, or both?`;

const BETA_LAUNCH_PLAN_V1 = `# Public beta launch plan (working copy)

## Product readiness gates
1. Installed-state-first findings are default and workflow terminal state is always visible.
2. Findings/files API stays paginated and responsive on large jobs.
3. Multi-org auth, RBAC, API keys, and usage enforcement are enabled.
4. Delete operation removes job artifacts from object store and relational job tables.

## Commercial readiness gates
1. Pricing plans finalized with Stripe products/prices and webhook secret configured.
2. Google OAuth production app approved and linked to final brand/domain.
3. Landing page + docs explain free CLI vs paid platform clearly.
4. Support, security, and compliance pages are published.

## GTM execution
1. Build and maintain 100-account ICP list (DevSecOps + Compliance contacts per account).
2. Run weekly outreach cadence with tracked response funnel.
3. Publish two technical deep-dives and one case study per month.
4. Demo success metric: first scan <24h and triage completion in pilot window.

## Pre-launch checklist
1. Finalize brand/legal checks and domain redirects.
2. Verify SSO, billing, and quota enforcement in production.
3. Run disaster recovery drills (DB backup restore + object store validation).
4. Set alerting for NodeNotReady, OOMKilled, and scanner queue lag.
5. Prepare launch-day runbook with rollback steps and on-call contacts.`;

const TARGET_LIST_PLAYBOOK_V1 = `# 100-account target list playbook

## ICP definition
1. Company size: 500-20,000 employees.
2. Stack signal: Kubernetes + containerized workloads + regulated operations.
3. Persona A: DevSecOps owner (Head of Platform Security, Cloud Security Lead, DevSecOps Manager).
4. Persona B: Compliance owner (GRC Lead, Security Compliance Manager, Audit Program Manager).

## Source priority
1. LinkedIn Sales Navigator.
2. Existing network/referrals.
3. Public conference speaker lists (KubeCon, RSA, BSides).
4. Job boards for DevSecOps/Kubernetes Security hiring.
5. GitHub org activity for K8s/security tooling.

## Build method
1. Collect 150 raw accounts.
2. Score each account (0-100):
   - 40% technical fit
   - 25% compliance pressure
   - 20% buying readiness
   - 15% warm-path potential
3. Keep top 100.
4. Assign one DevSecOps and one Compliance contact per account.
5. Track: Account, DevSecOps contact, Compliance contact, fit score, status, next action, owner.`;

const TECH_POSTING_CHANNELS_V1 = `# Technical posting channels

## Primary channels
1. LinkedIn (personal + company page)
2. Company blog on your domain
3. Dev.to cross-post

## Secondary channels
1. Medium publication
2. Hacker News (major technical deep-dives only)
3. Reddit communities (technical, non-salesy)
4. CNCF/Kubernetes Slack channels where promotion is allowed

## Cadence
1. Two technical deep-dives per month.
2. One practical case study per month.
3. Every post links to one CTA: Book demo or Start pilot.`;

const NAMING_SCORECARD_SEO_V1 = `# Naming scorecard with SEO

## Weighted criteria
1. Clarity (20%)
2. Memorability (15%)
3. Enterprise tone (15%)
4. Legal risk/trademark (20%)
5. Domain quality (15%)
6. SEO distinctiveness (15%)

## SEO distinctiveness checks
1. Low collision for exact brand term.
2. Search uniqueness for quoted brand.
3. Avoid names commonly used by unrelated tools.
4. Prefer pronounceable compounds with unique token.`;

const REBRAND_DOMAIN_SHORTLIST_V1 = `# Rebrand domain shortlist (v1)

Status note: candidate list only. Registration/availability must be verified at purchase time.

## Top 12 candidates (ranked)
1. StackSentry
   - Primary: \`stacksentry.com\`
   - Fallbacks: \`stacksentry.io\`, \`stacksentry.security\`
2. ArtifactSentry
   - Primary: \`artifactsentry.com\`
   - Fallbacks: \`artifactsentry.io\`, \`artifact-sentry.com\`
3. VulnAtlas
   - Primary: \`vulnatlas.com\`
   - Fallbacks: \`vulnatlas.io\`, \`vuln-atlas.com\`
4. PackageSentinel
   - Primary: \`packagesentinel.com\`
   - Fallbacks: \`package-sentinel.com\`, \`packagesentinel.io\`
5. ScanForge
   - Primary: \`scanforge.com\`
   - Fallbacks: \`scanforge.io\`, \`scan-forge.com\`
6. RiskLedger
   - Primary: \`riskledger.io\`
   - Fallbacks: \`riskledgersecurity.com\`, \`risk-ledger.com\`
7. BuildShield
   - Primary: \`buildshield.io\`
   - Fallbacks: \`build-shield.com\`, \`buildshieldsecurity.com\`
8. ImageProof
   - Primary: \`imageproof.io\`
   - Fallbacks: \`imageproofsecurity.com\`, \`image-proof.com\`
9. DependSecure
   - Primary: \`dependsecure.com\`
   - Fallbacks: \`dependsecure.io\`, \`depend-secure.com\`
10. SecureArtifact
   - Primary: \`secureartifact.com\`
   - Fallbacks: \`secureartifact.io\`, \`secure-artifact.com\`
11. ApplicaScan
   - Primary: \`applicascan.com\`
   - Fallbacks: \`applicascan.io\`, \`applica-scan.com\`
12. CVEPath
   - Primary: \`cvepath.com\`
   - Fallbacks: \`cvepath.io\`, \`cve-path.com\`

## Recommended next steps
1. Check trademark conflict risk before purchase.
2. Acquire top 2 candidates + typo defensive domains.
3. Reserve matching social handles and update OAuth consent branding.
4. Set redirect plan from current domains to the final brand domain.
5. Update app env vars:
   - \`NEXT_PUBLIC_APP_NAME\`
   - \`NEXT_PUBLIC_APP_DESCRIPTION\``;

const DEFAULT_ADMIN_CONTENT: Record<AdminContentKey, string> = {
  [ADMIN_CONTENT_KEYS.SALES_DEMO_SCRIPT]: SALES_DEMO_SCRIPT_V1,
  [ADMIN_CONTENT_KEYS.BETA_LAUNCH_PLAN]: BETA_LAUNCH_PLAN_V1,
  [ADMIN_CONTENT_KEYS.TARGET_LIST_PLAYBOOK]: TARGET_LIST_PLAYBOOK_V1,
  [ADMIN_CONTENT_KEYS.TECH_POSTING_CHANNELS]: TECH_POSTING_CHANNELS_V1,
  [ADMIN_CONTENT_KEYS.NAMING_SCORECARD_SEO]: NAMING_SCORECARD_SEO_V1,
  [ADMIN_CONTENT_KEYS.REBRAND_DOMAIN_SHORTLIST]: REBRAND_DOMAIN_SHORTLIST_V1,
};

export function getDefaultAdminContentEntries(): Array<{ key: string; contentMd: string }> {
  return Object.entries(DEFAULT_ADMIN_CONTENT).map(([key, contentMd]) => ({ key, contentMd }));
}

export function getDefaultAdminContent(key: string): string | null {
  if (Object.prototype.hasOwnProperty.call(DEFAULT_ADMIN_CONTENT, key)) {
    return DEFAULT_ADMIN_CONTENT[key as AdminContentKey];
  }
  return null;
}

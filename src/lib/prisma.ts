import { PrismaClient } from "@/generated/prisma";
import { getDefaultAdminContentEntries } from "@/lib/adminContent";
import { STARTER_TARGET_ACCOUNTS } from "@/lib/targetAccountsSeed";

const DEFAULT_ORG_SLUG = (process.env.DEFAULT_ORG_SLUG || "default-org").trim();
const DEFAULT_ORG_NAME = (process.env.DEFAULT_ORG_NAME || "Default Org").trim();

export const ADMIN_OVERRIDE_MASK = "9223372036854775807";

export const ROLE_MASKS = {
    VIEWER: 1,
    ANALYST: 2,
    OPERATOR: 4,
    SCAN_ADMIN: 8,
    POLICY_ADMIN: 16,
    BILLING_ADMIN: 32,
    API_KEY_ADMIN: 64,
    ORG_OWNER: 128,
} as const;

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

let ensureSchemaPromise: Promise<void> | null = null;

async function ensurePlanSeeds() {
    await prisma.$executeRawUnsafe(`
INSERT INTO plans (code, name, monthly_scan_limit, max_registries, active)
VALUES
  ('FREE', 'Free', 25, 2, TRUE),
  ('BASIC', 'Basic', 500, 10, TRUE),
  ('PRO', 'Pro', 5000, 50, TRUE),
  ('ENTERPRISE', 'Enterprise', NULL, NULL, TRUE)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    monthly_scan_limit = EXCLUDED.monthly_scan_limit,
    max_registries = EXCLUDED.max_registries,
    active = EXCLUDED.active;
    `);
}

async function ensureDefaultOrgAndBackfill() {
    await prisma.$executeRaw`
INSERT INTO orgs (slug, name)
VALUES (${DEFAULT_ORG_SLUG}, ${DEFAULT_ORG_NAME})
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
    `;

    const orgRows = await prisma.$queryRaw<Array<{ id: string }>>`
SELECT id::text AS id FROM orgs WHERE slug=${DEFAULT_ORG_SLUG} LIMIT 1
    `;
    const orgId = orgRows[0]?.id;
    if (!orgId) return;

    await prisma.$executeRaw`
INSERT INTO scanner_settings (org_id)
VALUES (${orgId}::uuid)
ON CONFLICT (org_id) DO NOTHING
    `;

    try {
        await prisma.$executeRaw`
UPDATE scan_jobs SET org_id=${orgId}::uuid WHERE org_id IS NULL
        `;
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // Some deployments bootstrap scan_jobs separately and may not expose org_id yet.
        if (!/org_id|scan_jobs|permission denied|must be owner|42501|42703|42P01/i.test(msg)) {
            throw e;
        }
    }

    const adminEmailRaw = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (!adminEmailRaw) return;

    await prisma.$executeRaw`
INSERT INTO users (email, name, auth_provider, token_version)
VALUES (${adminEmailRaw}, ${adminEmailRaw}, 'credentials', 0)
ON CONFLICT (email) DO NOTHING
    `;

    const userRows = await prisma.$queryRaw<Array<{ id: string }>>`
SELECT id::text AS id FROM users WHERE email=${adminEmailRaw} LIMIT 1
    `;
    const userId = userRows[0]?.id;
    if (!userId) return;

    await prisma.$executeRaw`
INSERT INTO org_memberships (org_id, user_id, roles_mask, status)
VALUES (${orgId}::uuid, ${userId}::uuid, CAST(${ADMIN_OVERRIDE_MASK} AS BIGINT), 'active')
ON CONFLICT (org_id, user_id)
DO UPDATE SET roles_mask = CAST(${ADMIN_OVERRIDE_MASK} AS BIGINT), status = 'active'
    `;
}

async function ensureAdminContentSeeds() {
    const defaults = getDefaultAdminContentEntries();
    for (const entry of defaults) {
        await prisma.$executeRaw`
INSERT INTO admin_content (key, content_md)
VALUES (${entry.key}, ${entry.contentMd})
ON CONFLICT (key) DO NOTHING
        `;
    }
}

function toTargetAccountKey(accountName: string, accountDomain: string): string {
    return `${accountName.trim().toLowerCase()}|${accountDomain.trim().toLowerCase()}`;
}

async function ensureStarterTargetAccounts() {
    const rows = await prisma.$queryRaw<Array<{ c: string }>>`
SELECT COUNT(*)::text AS c FROM admin_target_accounts
    `;
    const count = Number(rows[0]?.c || "0");
    if (count > 0) return;

    for (const item of STARTER_TARGET_ACCOUNTS) {
        const key = toTargetAccountKey(item.accountName, item.accountDomain);
        await prisma.$executeRaw`
INSERT INTO admin_target_accounts (
  account_key,
  account_name,
  account_domain,
  industry,
  company_size,
  fit_score,
  status,
  next_action,
  owner,
  source
)
VALUES (
  ${key},
  ${item.accountName},
  ${item.accountDomain},
  ${item.industry},
  ${item.companySize},
  ${item.fitScore},
  ${item.status},
  ${item.nextAction},
  ${item.owner},
  ${item.source}
)
ON CONFLICT (account_key) DO NOTHING
        `;
    }
}

function isMultiCommandPreparedStatementError(message: string): boolean {
    return /cannot insert multiple commands into a prepared statement|42601/i.test(message);
}

async function ensurePlatformSchemaCompat() {
    const requiredStatements = [
        `
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'credentials',
  theme_preference TEXT NOT NULL DEFAULT 'system',
  active_org_id UUID,
  token_version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'system'`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS active_org_id UUID`,
        `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_active_org_id_fkey') THEN
    ALTER TABLE users
      ADD CONSTRAINT users_active_org_id_fkey FOREIGN KEY (active_org_id) REFERENCES orgs(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$
        `,
        `
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_theme_preference_check;
    ALTER TABLE users
      ADD CONSTRAINT users_theme_preference_check
      CHECK (theme_preference IN ('light', 'dark', 'system'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$
        `,
        `
CREATE TABLE IF NOT EXISTS org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roles_mask BIGINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
)
        `,
        `
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  monthly_scan_limit INTEGER,
  max_registries INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `
CREATE TABLE IF NOT EXISTS org_billing (
  org_id UUID PRIMARY KEY REFERENCES orgs(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `
CREATE TABLE IF NOT EXISTS org_usage_monthly (
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,
  scan_count_total INTEGER NOT NULL DEFAULT 0,
  scan_count_api INTEGER NOT NULL DEFAULT 0,
  scan_count_ui INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, year_month)
)
        `,
        `
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  roles_mask BIGINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, prefix)
)
        `,
        `
CREATE TABLE IF NOT EXISTS org_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  roles_mask BIGINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  token_hash TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `
CREATE TABLE IF NOT EXISTS scanner_settings (
  org_id UUID PRIMARY KEY REFERENCES orgs(id) ON DELETE CASCADE,
  mode_default TEXT NOT NULL DEFAULT 'light',
  light_allow_heuristic_fallback BOOLEAN NOT NULL DEFAULT TRUE,
  deep_require_installed_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  nvd_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  osv_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  redhat_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  epss_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  kev_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  debian_tracker_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ubuntu_tracker_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  alpine_secdb_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  redhat_unfixed_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  skip_cache BOOLEAN NOT NULL DEFAULT FALSE,
  nvd_api_key TEXT NOT NULL DEFAULT '',
  nvd_concurrency INTEGER NOT NULL DEFAULT 3,
  nvd_retry_max INTEGER NOT NULL DEFAULT 5,
  nvd_timeout_secs INTEGER NOT NULL DEFAULT 20,
  global_nvd_rate_per_minute INTEGER NOT NULL DEFAULT 40,
  osv_batch_size INTEGER NOT NULL DEFAULT 50,
  osv_timeout_secs INTEGER NOT NULL DEFAULT 60,
  redhat_cve_concurrency INTEGER NOT NULL DEFAULT 4,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS epss_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS kev_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS debian_tracker_enabled BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS ubuntu_tracker_enabled BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS alpine_secdb_enabled BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS redhat_unfixed_enabled BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS nvd_api_key TEXT NOT NULL DEFAULT ''`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS osv_batch_size INTEGER NOT NULL DEFAULT 50`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS osv_timeout_secs INTEGER NOT NULL DEFAULT 60`,
        `ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS redhat_cve_concurrency INTEGER NOT NULL DEFAULT 4`,
        `
CREATE TABLE IF NOT EXISTS admin_content (
  key TEXT PRIMARY KEY,
  content_md TEXT NOT NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `
CREATE TABLE IF NOT EXISTS admin_content_versions (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL REFERENCES admin_content(key) ON DELETE CASCADE,
  content_md TEXT NOT NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `
CREATE TABLE IF NOT EXISTS admin_target_accounts (
  id BIGSERIAL PRIMARY KEY,
  account_key TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_domain TEXT NOT NULL DEFAULT '',
  industry TEXT,
  company_size TEXT,
  devsecops_contact_name TEXT,
  devsecops_contact_title TEXT,
  devsecops_contact_email TEXT,
  compliance_contact_name TEXT,
  compliance_contact_title TEXT,
  compliance_contact_email TEXT,
  fit_score INTEGER NOT NULL DEFAULT 0 CHECK (fit_score >= 0 AND fit_score <= 100),
  status TEXT NOT NULL DEFAULT 'prospect',
  next_action TEXT,
  owner TEXT,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
        `,
        `
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'scan_jobs'
  ) THEN
    CREATE TABLE IF NOT EXISTS scan_packages (
      id BIGSERIAL PRIMARY KEY,
      job_id UUID NOT NULL REFERENCES scan_jobs(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      ecosystem TEXT NOT NULL,
      version TEXT NOT NULL,
      source_kind TEXT NOT NULL,
      source_path TEXT,
      confidence_tier TEXT NOT NULL DEFAULT 'confirmed_installed',
      evidence_source TEXT NOT NULL DEFAULT 'installed_db',
      raw JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(job_id, name, ecosystem, version, source_kind, source_path)
    );
  END IF;
END$$
        `,
        `
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'scan_packages'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_scan_packages_job_name_version ON scan_packages(job_id, name, version);
    CREATE INDEX IF NOT EXISTS idx_scan_packages_job_source_path ON scan_packages(job_id, source_path);
  END IF;
END$$
        `,
        `
CREATE TABLE IF NOT EXISTS registry_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    registry_url    TEXT NOT NULL,
    username        TEXT,
    token_encrypted BYTEA,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, name)
)
        `,
        `CREATE INDEX IF NOT EXISTS idx_registry_configs_org ON registry_configs(org_id)`,
        `ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_registries INTEGER`,
        `ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'upload'`,
        `ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS registry_image TEXT`,
        `ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS registry_config_id UUID`,
        `ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS sbom_status TEXT NOT NULL DEFAULT 'pending'`,
        `ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS sbom_diff_summary JSONB`,
        `ALTER TABLE orgs ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'FREE'`,
        `ALTER TABLE orgs ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`,
        `ALTER TABLE orgs ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`,
        `ALTER TABLE orgs ADD COLUMN IF NOT EXISTS plan_seats INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE orgs ADD COLUMN IF NOT EXISTS plan_period_end TIMESTAMPTZ`,
        `CREATE INDEX IF NOT EXISTS idx_org_memberships_org_user ON org_memberships(org_id, user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_users_active_org ON users(active_org_id)`,
        `CREATE INDEX IF NOT EXISTS idx_api_keys_org_status ON api_keys(org_id, status)`,
        `CREATE INDEX IF NOT EXISTS idx_org_invites_org_status_expires ON org_invites(org_id, status, expires_at)`,
        `CREATE INDEX IF NOT EXISTS idx_org_invites_email ON org_invites(LOWER(email))`,
        `CREATE INDEX IF NOT EXISTS idx_org_usage_monthly_org_period ON org_usage_monthly(org_id, year_month)`,
        `CREATE INDEX IF NOT EXISTS idx_admin_content_versions_key_created_at ON admin_content_versions(key, created_at DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_admin_target_accounts_fit_score ON admin_target_accounts(fit_score DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_admin_target_accounts_status ON admin_target_accounts(status)`,
        `
CREATE TABLE IF NOT EXISTS scan_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  registry_config_id UUID REFERENCES registry_configs(id) ON DELETE SET NULL,
  image_ref TEXT NOT NULL,
  cron_expression TEXT NOT NULL DEFAULT '0 0 * * *',
  scan_mode TEXT NOT NULL DEFAULT 'light',
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
        `,
        `CREATE INDEX IF NOT EXISTS idx_scan_schedules_org ON scan_schedules(org_id)`,
        `CREATE INDEX IF NOT EXISTS idx_scan_schedules_enabled_next ON scan_schedules(enabled, next_run_at)`,
        `
CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
        `,
        `CREATE INDEX IF NOT EXISTS idx_notification_channels_org ON notification_channels(org_id)`,
    ];

    for (const stmt of requiredStatements) {
        await prisma.$executeRawUnsafe(stmt);
    }
}

async function ensurePlatformSchemaInner() {
    try {
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // Managed Postgres often denies CREATE EXTENSION to app roles.
        // Postgres 13+ provides gen_random_uuid() without pgcrypto, so continue.
        if (!/permission denied|must have create privilege|not superuser|42501/i.test(msg)) {
            throw e;
        }
    }

    try {
        await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'credentials',
  theme_preference TEXT NOT NULL DEFAULT 'system',
  active_org_id UUID,
  token_version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roles_mask BIGINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  monthly_scan_limit INTEGER,
  max_registries INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_billing (
  org_id UUID PRIMARY KEY REFERENCES orgs(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_usage_monthly (
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,
  scan_count_total INTEGER NOT NULL DEFAULT 0,
  scan_count_api INTEGER NOT NULL DEFAULT 0,
  scan_count_ui INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, year_month)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  roles_mask BIGINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, prefix)
);

CREATE TABLE IF NOT EXISTS org_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  roles_mask BIGINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  token_hash TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scanner_settings (
  org_id UUID PRIMARY KEY REFERENCES orgs(id) ON DELETE CASCADE,
  mode_default TEXT NOT NULL DEFAULT 'light',
  light_allow_heuristic_fallback BOOLEAN NOT NULL DEFAULT TRUE,
  deep_require_installed_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  nvd_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  osv_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  redhat_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  epss_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  kev_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  debian_tracker_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ubuntu_tracker_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  alpine_secdb_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  redhat_unfixed_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  skip_cache BOOLEAN NOT NULL DEFAULT FALSE,
  nvd_api_key TEXT NOT NULL DEFAULT '',
  nvd_concurrency INTEGER NOT NULL DEFAULT 3,
  nvd_retry_max INTEGER NOT NULL DEFAULT 5,
  nvd_timeout_secs INTEGER NOT NULL DEFAULT 20,
  global_nvd_rate_per_minute INTEGER NOT NULL DEFAULT 40,
  osv_batch_size INTEGER NOT NULL DEFAULT 50,
  osv_timeout_secs INTEGER NOT NULL DEFAULT 60,
  redhat_cve_concurrency INTEGER NOT NULL DEFAULT 4,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS epss_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS kev_enrich_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS debian_tracker_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS ubuntu_tracker_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS alpine_secdb_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS redhat_unfixed_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS nvd_api_key TEXT NOT NULL DEFAULT '';
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS osv_batch_size INTEGER NOT NULL DEFAULT 50;
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS osv_timeout_secs INTEGER NOT NULL DEFAULT 60;
ALTER TABLE scanner_settings ADD COLUMN IF NOT EXISTS redhat_cve_concurrency INTEGER NOT NULL DEFAULT 4;

CREATE TABLE IF NOT EXISTS admin_content (
  key TEXT PRIMARY KEY,
  content_md TEXT NOT NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_content_versions (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL REFERENCES admin_content(key) ON DELETE CASCADE,
  content_md TEXT NOT NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_target_accounts (
  id BIGSERIAL PRIMARY KEY,
  account_key TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_domain TEXT NOT NULL DEFAULT '',
  industry TEXT,
  company_size TEXT,
  devsecops_contact_name TEXT,
  devsecops_contact_title TEXT,
  devsecops_contact_email TEXT,
  compliance_contact_name TEXT,
  compliance_contact_title TEXT,
  compliance_contact_email TEXT,
  fit_score INTEGER NOT NULL DEFAULT 0 CHECK (fit_score >= 0 AND fit_score <= 100),
  status TEXT NOT NULL DEFAULT 'prospect',
  next_action TEXT,
  owner TEXT,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scan_jobs (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('queued','running','done','failed','deleting')),
  bucket TEXT NOT NULL,
  object_key TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'light',
  format TEXT NOT NULL DEFAULT 'json',
  refs BOOLEAN NOT NULL DEFAULT FALSE,
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  settings_snapshot JSONB,
  scan_status TEXT,
  inventory_status TEXT,
  inventory_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  progress_msg TEXT,
  report_bucket TEXT,
  report_key TEXT,
  error_msg TEXT,
  summary_json JSONB
);

CREATE TABLE IF NOT EXISTS scan_events (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES scan_jobs(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  stage TEXT NOT NULL,
  detail TEXT NOT NULL,
  pct SMALLINT
);

CREATE TABLE IF NOT EXISTS scan_findings (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES scan_jobs(id) ON DELETE CASCADE,
  finding_id TEXT NOT NULL,
  package_name TEXT,
  package_ecosystem TEXT,
  package_version TEXT,
  severity TEXT,
  cvss_base DOUBLE PRECISION,
  cvss_vector TEXT,
  confidence_tier TEXT NOT NULL DEFAULT 'confirmed_installed',
  evidence_source TEXT NOT NULL DEFAULT 'installed_db',
  accuracy_note TEXT,
  fixed BOOLEAN,
  fixed_in TEXT,
  recommendation TEXT,
  description TEXT,
  source_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, finding_id, package_name, package_version, confidence_tier)
);

CREATE TABLE IF NOT EXISTS scan_finding_refs (
  id BIGSERIAL PRIMARY KEY,
  finding_row_id BIGINT NOT NULL REFERENCES scan_findings(id) ON DELETE CASCADE,
  ref_type TEXT NOT NULL,
  url TEXT NOT NULL,
  UNIQUE(finding_row_id, ref_type, url)
);

CREATE TABLE IF NOT EXISTS scan_files (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES scan_jobs(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  size_bytes BIGINT,
  mode TEXT,
  mtime TIMESTAMPTZ,
  sha256 TEXT,
  parent_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, path)
);

CREATE TABLE IF NOT EXISTS scan_packages (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES scan_jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ecosystem TEXT NOT NULL,
  version TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  source_path TEXT,
  confidence_tier TEXT NOT NULL DEFAULT 'confirmed_installed',
  evidence_source TEXT NOT NULL DEFAULT 'installed_db',
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, name, ecosystem, version, source_kind, source_path)
);

CREATE TABLE IF NOT EXISTS registry_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    registry_url    TEXT NOT NULL,
    username        TEXT,
    token_encrypted BYTEA,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, name)
);
CREATE INDEX IF NOT EXISTS idx_registry_configs_org ON registry_configs(org_id);

CREATE TABLE IF NOT EXISTS scan_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  registry_config_id UUID REFERENCES registry_configs(id) ON DELETE SET NULL,
  image_ref TEXT NOT NULL,
  cron_expression TEXT NOT NULL DEFAULT '0 0 * * *',
  scan_mode TEXT NOT NULL DEFAULT 'light',
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scan_schedules_org ON scan_schedules(org_id);
CREATE INDEX IF NOT EXISTS idx_scan_schedules_enabled_next ON scan_schedules(enabled, next_run_at);

CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notification_channels_org ON notification_channels(org_id);

ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS created_by_user_id UUID;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS created_by_api_key_id UUID;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS settings_snapshot JSONB;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS scan_status TEXT;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS inventory_status TEXT;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS inventory_reason TEXT;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'upload';
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS registry_image TEXT;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS registry_config_id UUID;
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS sbom_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'FREE';
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS plan_seats INTEGER NOT NULL DEFAULT 1;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS plan_period_end TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'system';
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_org_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_theme_preference_check;
    ALTER TABLE users
      ADD CONSTRAINT users_theme_preference_check
      CHECK (theme_preference IN ('light', 'dark', 'system'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scan_jobs_status_check') THEN
    ALTER TABLE scan_jobs DROP CONSTRAINT scan_jobs_status_check;
  END IF;
  ALTER TABLE scan_jobs
    ADD CONSTRAINT scan_jobs_status_check CHECK (status IN ('queued','running','done','failed','deleting'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

CREATE INDEX IF NOT EXISTS idx_org_memberships_org_user ON org_memberships(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_users_active_org ON users(active_org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org_status ON api_keys(org_id, status);
CREATE INDEX IF NOT EXISTS idx_org_invites_org_status_expires ON org_invites(org_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON org_invites(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_org_usage_monthly_org_period ON org_usage_monthly(org_id, year_month);

CREATE INDEX IF NOT EXISTS idx_scan_jobs_status_created ON scan_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_org_status_created ON scan_jobs(org_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_org_created ON scan_jobs(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scan_events_job_ts ON scan_events(job_id, ts);
CREATE INDEX IF NOT EXISTS idx_scan_events_job_id_id ON scan_events(job_id, id);

CREATE INDEX IF NOT EXISTS idx_scan_findings_job_sev_id ON scan_findings(job_id, severity, finding_id);
CREATE INDEX IF NOT EXISTS idx_scan_findings_job_tier ON scan_findings(job_id, confidence_tier);
CREATE INDEX IF NOT EXISTS idx_scan_findings_job_fixed ON scan_findings(job_id, fixed);
CREATE INDEX IF NOT EXISTS idx_scan_findings_source_ids_gin ON scan_findings USING GIN (source_ids);
CREATE INDEX IF NOT EXISTS idx_scan_findings_raw_gin ON scan_findings USING GIN (raw);

CREATE INDEX IF NOT EXISTS idx_scan_finding_refs_finding ON scan_finding_refs(finding_row_id);

CREATE INDEX IF NOT EXISTS idx_scan_files_job_parent_path ON scan_files(job_id, parent_path, path);
CREATE INDEX IF NOT EXISTS idx_scan_files_job_path ON scan_files(job_id, path);
CREATE INDEX IF NOT EXISTS idx_scan_packages_job_name_version ON scan_packages(job_id, name, version);
CREATE INDEX IF NOT EXISTS idx_scan_packages_job_source_path ON scan_packages(job_id, source_path);
CREATE INDEX IF NOT EXISTS idx_admin_content_versions_key_created_at ON admin_content_versions(key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_target_accounts_fit_score ON admin_target_accounts(fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_admin_target_accounts_status ON admin_target_accounts(status);

CREATE OR REPLACE FUNCTION notify_job_event() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('job_events', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'scan_jobs_notify') THEN
    CREATE TRIGGER scan_jobs_notify
    AFTER INSERT OR UPDATE ON scan_jobs
    FOR EACH ROW EXECUTE FUNCTION notify_job_event();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_active_org_id_fkey') THEN
    ALTER TABLE users
      ADD CONSTRAINT users_active_org_id_fkey FOREIGN KEY (active_org_id) REFERENCES orgs(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scan_jobs_org_id_fkey') THEN
    ALTER TABLE scan_jobs
      ADD CONSTRAINT scan_jobs_org_id_fkey FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scan_jobs_created_by_user_id_fkey') THEN
    ALTER TABLE scan_jobs
      ADD CONSTRAINT scan_jobs_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scan_jobs_created_by_api_key_id_fkey') THEN
    ALTER TABLE scan_jobs
      ADD CONSTRAINT scan_jobs_created_by_api_key_id_fkey FOREIGN KEY (created_by_api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL;
  END IF;
END$$;
    `);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!isMultiCommandPreparedStatementError(msg)) {
            throw e;
        }
        await ensurePlatformSchemaCompat();
    }

    await ensurePlanSeeds();
    await ensureDefaultOrgAndBackfill();
    await ensureAdminContentSeeds();
    await ensureStarterTargetAccounts();

    // ---------------------------------------------------------------
    // pg_cron retention — removes scan_events older than 30 days for
    // completed jobs. Runs daily at 03:00 UTC. Safe to re-run:
    // cron.schedule() with same name updates the existing job.
    //
    // Observability: run this query to check scan_events table size:
    // SELECT pg_size_pretty(pg_total_relation_size('scan_events')) AS table_size,
    //        COUNT(*) AS row_count FROM scan_events;
    // ---------------------------------------------------------------
    try {
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_cron;`);
        await prisma.$executeRawUnsafe(`
            SELECT cron.schedule(
                'scan-events-retention',
                '0 3 * * *',
                $$
                    DELETE FROM scan_events
                    WHERE ts < now() - INTERVAL '30 days'
                      AND job_id IN (
                        SELECT id FROM scan_jobs
                        WHERE status IN ('done', 'failed')
                      )
                $$
            );
        `);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn('[prisma] pg_cron not available — retention job not scheduled:', msg);
    }
}

export async function ensurePlatformSchema() {
    if (ensureSchemaPromise) return ensureSchemaPromise;
    ensureSchemaPromise = ensurePlatformSchemaInner().catch((e) => {
        ensureSchemaPromise = null;
        throw e;
    });
    return ensureSchemaPromise;
}

// Backward compatibility for existing callers.
export async function ensureJobsTable() {
    await ensurePlatformSchema();
}

export async function getDefaultOrgId(): Promise<string> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
SELECT id::text AS id FROM orgs WHERE slug=${DEFAULT_ORG_SLUG} LIMIT 1
    `;
    if (!rows[0]?.id) {
        throw new Error(`default org not found for slug ${DEFAULT_ORG_SLUG}`);
    }
    return rows[0].id;
}

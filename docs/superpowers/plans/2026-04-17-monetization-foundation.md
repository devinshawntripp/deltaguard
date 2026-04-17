# Monetization Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the monetization foundation — tiered vulnerability databases, API key enforcement in the CLI, per-developer pricing, and Stripe payment processing — so ScanRook can charge for premium enrichment data.

**Architecture:** The CLI checks its API key against the ScanRook API on `db fetch` and enrichment requests. The API returns the user's plan tier, which determines which vulndb (free vs full) is served and which enrichment sources are enabled. Stripe handles payment. The vulndb build pipeline produces two separate SQLite databases per cycle.

**Tech Stack:** Rust (scanner CLI), Next.js + Prisma (API), Python (vulndb build), Stripe SDK, PostgreSQL, MinIO/S3

---

## File Structure

### New Files
- `scanrook-ui/src/app/api/db/latest/route.ts` — MODIFY: add plan-tier gating to return free vs full DB URL
- `scanrook-ui/src/app/api/billing/checkout/route.ts` — MODIFY: finish Stripe checkout flow
- `scanrook-ui/src/app/api/billing/webhook/route.ts` — MODIFY: handle Stripe webhook events
- `scanrook-ui/src/app/api/billing/portal/route.ts` — MODIFY: customer portal redirect
- `scanrook-ui/src/app/api/cli/plan/route.ts` — CREATE: returns the caller's plan tier and enabled features
- `scanrook-ui/src/app/(dashboard)/dashboard/billing/page.tsx` — MODIFY: remove "coming soon", wire up Stripe
- `scanrook-ui/prisma/migrations/xxx_add_plan_tiers/` — CREATE: add plan_tier enum + stripe fields to orgs
- `rust_scanner/src/cli/auth.rs` — MODIFY: add plan-tier caching + feature gating
- `rust_scanner/src/vuln/mod.rs` — MODIFY: check plan tier before enabling enrichment sources
- `scripts/vulndb-pg-import.py` — MODIFY: produce two DBs (free + full)

### Existing Files Modified
- `scanrook-ui/src/lib/prisma.ts` — add plan_tier to org schema bootstrap
- `scanrook-ui/src/lib/authOptions.ts` — include plan_tier in JWT token
- `scanrook-ui/src/app/api/db/latest/route.ts` — gate DB download by plan
- `rust_scanner/src/vulndb/build.rs` — handle free vs full DB in `fetch_db()`
- `rust_scanner/src/cli/db.rs` — pass API key to fetch endpoint

---

## Phase 2A: Tiered Vulnerability Database

### Task 1: Modify vulndb-pg-import to produce two databases

**Files:**
- Modify: `scanrook-ui/scripts/vulndb-pg-import.py:1608-1625`

- [ ] **Step 1: Add `export_free_db()` function that exports OSV + basic NVD only**

After `export_pg_to_sqlite()` (which produces the full DB), add a second export that skips EPSS, KEV, OVAL, Debian tracker, Ubuntu tracker, and Alpine SecDB tables. The free DB includes:
- `osv_packages` and `osv_payloads` tables (OSV ecosystem data)
- `nvd_cves` table (basic NVD CVE data)
- `metadata` table with `tier=free` marker
- Does NOT include: `epss_scores`, `kev_entries`, `oval_definitions`, `oval_test_constraints`, `debian_advisories`, `ubuntu_advisories`, `alpine_advisories`

```python
def export_free_db(conn, sqlite_path: str, summary: dict):
    """Export a free-tier SQLite DB with OSV + basic NVD only."""
    log.info("=== Free-tier SQLite export starting → %s ===", sqlite_path)
    started = time.time()

    if os.path.exists(sqlite_path):
        os.remove(sqlite_path)

    sconn = sqlite3.connect(sqlite_path)
    sconn.executescript(SQLITE_SCHEMA)

    # NVD export (same as full, with dict compression)
    # ... (reuse existing NVD export logic)

    # OSV export (same as full, with dict compression)
    # ... (reuse existing OSV export logic)

    # Set metadata to mark this as free tier
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('tier', 'free')")
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('build_date', ?)",
                  (datetime.now(timezone.utc).strftime("%Y-%m-%d"),))
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', '2')")
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('dict_compression', '1')")

    sconn.execute("PRAGMA optimize")
    sconn.commit()
    sconn.close()

    elapsed = time.time() - started
    size_mb = os.path.getsize(sqlite_path) / (1024 * 1024)
    log.info("Free-tier SQLite export complete: %.1f MB in %.1fs", size_mb, elapsed)
```

- [ ] **Step 2: Refactor `export_pg_to_sqlite` to accept a `tier` parameter**

Extract the NVD and OSV export blocks into helper functions (`_export_nvd_to_sqlite`, `_export_osv_to_sqlite`) so both the free and full export paths can reuse them without code duplication.

- [ ] **Step 3: Call both exports in `main()` and upload both to MinIO**

In the `do_export` block (~line 1608), after the full export:

```python
if do_export:
    conn = pg_connect(db_url)
    try:
        scratch = os.environ.get("SCRATCH_DIR", None)
        with tempfile.TemporaryDirectory(dir=scratch) as tmpdir:
            date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

            # Full DB (paid tier)
            full_name = f"scanrook-db-{date_str}.sqlite"
            full_path = os.path.join(tmpdir, full_name)
            export_pg_to_sqlite(conn, full_path, summary)
            upload_to_minio(full_path, full_name)

            # Free DB (OSV + basic NVD only)
            free_name = f"scanrook-db-free-{date_str}.sqlite"
            free_path = os.path.join(tmpdir, free_name)
            export_free_db(conn, free_path, summary)
            upload_to_minio(free_path, free_name)
    finally:
        conn.close()
```

- [ ] **Step 4: Update `upload_to_minio` prune logic to handle both prefixes**

The prune in `upload_to_minio` currently only handles `scanrook-db-` prefix. Update it to also prune `scanrook-db-free-` files, keeping 3 of each.

- [ ] **Step 5: Test locally by running the export with a test PG connection**

```bash
cd scanrook-ui/scripts
DATABASE_URL="..." S3_ENDPOINT="..." python vulndb-pg-import.py
# Verify both files appear in MinIO vulndb bucket
```

- [ ] **Step 6: Commit**

```bash
git add scripts/vulndb-pg-import.py
git commit -m "feat: produce free-tier and full vulndb builds

Free DB includes OSV + basic NVD (~300-400MB).
Full DB adds EPSS, KEV, OVAL, distro trackers (~1.5GB).
Both uploaded to MinIO vulndb bucket with date-stamped keys."
```

### Task 2: Gate `/api/db/latest` by plan tier

**Files:**
- Modify: `scanrook-ui/src/app/api/db/latest/route.ts`
- Reference: `scanrook-ui/src/lib/prisma.ts` (for API key lookup)

- [ ] **Step 1: Add API key validation to the endpoint**

The CLI sends its API key via `Authorization: Bearer <key>` header. Look up the key in the `api_keys` table, find the associated org, check the org's plan tier.

```typescript
// After the User-Agent check, add:
const authHeader = req.headers.get("authorization") || "";
const apiKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

let tier = "free"; // default: free tier
if (apiKey) {
  const keyRow = await prisma.api_keys.findFirst({
    where: { key_hash: hashApiKey(apiKey), revoked: false },
    select: { org_id: true },
  });
  if (keyRow) {
    const org = await prisma.organizations.findUnique({
      where: { id: keyRow.org_id },
      select: { plan_tier: true },
    });
    if (org && org.plan_tier !== "FREE") {
      tier = "full";
    }
  }
}
```

- [ ] **Step 2: Return different DB based on tier**

```typescript
// When listing objects, filter by prefix based on tier
const prefix = tier === "full" ? "scanrook-db-" : "scanrook-db-free-";
const listResp = await s3Internal.send(
  new ListObjectsV2Command({
    Bucket: VULNDB_BUCKET,
    Prefix: prefix,
  })
);

// Exclude the free DBs from the full listing and vice versa
const objects = (listResp.Contents || [])
  .filter((o) => {
    const key = o.Key || "";
    if (tier === "full") return key.startsWith("scanrook-db-") && !key.startsWith("scanrook-db-free-");
    return key.startsWith("scanrook-db-free-");
  })
  .sort((a, b) => (b.Key || "").localeCompare(a.Key || ""));
```

- [ ] **Step 3: Include tier in the response JSON**

```typescript
return NextResponse.json({
  url: presignedUrl,
  build_date: buildDate,
  size: head.ContentLength || 0,
  key,
  tier,  // "free" or "full"
});
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/db/latest/route.ts
git commit -m "feat: gate vulndb download by plan tier

Free plans get OSV+NVD-only DB. Paid plans get full DB with
EPSS, KEV, OVAL, and distro tracker data."
```

### Task 3: Update CLI `db fetch` to pass API key

**Files:**
- Modify: `rust_scanner/src/vulndb/build.rs` (the `fetch_db` function)
- Modify: `rust_scanner/src/cli/db.rs` (where `fetch_db` is called)

- [ ] **Step 1: Add Authorization header to the fetch request**

In `build.rs`, the `fetch_db()` function calls the `/api/db/latest` endpoint. Add the stored API key as a Bearer token:

```rust
// In fetch_db(), when building the request to /api/db/latest:
let mut req = client.get(&url)
    .header("User-Agent", format!("scanrook-cli/{}", env!("CARGO_PKG_VERSION")));

// Add API key if available
if let Some(key) = crate::usercli::get_stored_api_key() {
    req = req.header("Authorization", format!("Bearer {}", key));
}

let resp = req.send()?;
```

- [ ] **Step 2: Display the tier in the download progress output**

```rust
// After parsing the JSON response:
let tier = json["tier"].as_str().unwrap_or("free");
progress("db.fetch.tier", tier);
if tier == "free" {
    progress("db.fetch.info", "Free tier: OSV + basic NVD. Upgrade for EPSS, KEV, OVAL enrichment.");
}
```

- [ ] **Step 3: Commit**

```bash
git add src/vulndb/build.rs src/cli/db.rs
git commit -m "feat: pass API key to db fetch endpoint

CLI sends stored API key as Bearer token. Server returns
free or full DB based on the org's plan tier."
```

---

## Phase 2B: API Key Plan Enforcement in CLI

### Task 4: Create `/api/cli/plan` endpoint

**Files:**
- Create: `scanrook-ui/src/app/api/cli/plan/route.ts`

- [ ] **Step 1: Create the endpoint**

This endpoint returns the caller's plan tier and which enrichment sources are enabled:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!apiKey) {
    return NextResponse.json({
      tier: "free",
      enrichment: { osv: true, nvd: false, oval: false, epss: false, kev: false, distro_trackers: false },
      output_formats: ["text"],
      db_tier: "free",
    });
  }

  const keyRow = await prisma.$queryRaw`
    SELECT ak.org_id, o.plan_tier
    FROM api_keys ak
    JOIN organizations o ON o.id = ak.org_id
    WHERE ak.key_hash = ${hashApiKey(apiKey)} AND ak.revoked = false
    LIMIT 1
  ` as any[];

  if (!keyRow.length) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }

  const plan = keyRow[0].plan_tier || "FREE";

  const plans: Record<string, any> = {
    FREE: {
      tier: "free",
      enrichment: { osv: true, nvd: false, oval: false, epss: false, kev: false, distro_trackers: false },
      output_formats: ["text"],
      db_tier: "free",
    },
    DEVELOPER: {
      tier: "developer",
      enrichment: { osv: true, nvd: true, oval: false, epss: true, kev: true, distro_trackers: false },
      output_formats: ["text", "json", "ndjson"],
      db_tier: "free",
    },
    TEAM: {
      tier: "team",
      enrichment: { osv: true, nvd: true, oval: true, epss: true, kev: true, distro_trackers: true },
      output_formats: ["text", "json", "ndjson"],
      db_tier: "full",
    },
    ENTERPRISE: {
      tier: "enterprise",
      enrichment: { osv: true, nvd: true, oval: true, epss: true, kev: true, distro_trackers: true },
      output_formats: ["text", "json", "ndjson"],
      db_tier: "full",
    },
  };

  return NextResponse.json(plans[plan] || plans.FREE);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/cli/plan/route.ts
git commit -m "feat: add /api/cli/plan endpoint for plan-tier lookup

Returns enrichment sources, output formats, and DB tier
based on the caller's API key and org plan."
```

### Task 5: Enforce plan tier in the Rust CLI

**Files:**
- Modify: `rust_scanner/src/vuln/mod.rs` (enrichment source toggles)
- Modify: `rust_scanner/src/cli/auth.rs` or `rust_scanner/src/usercli.rs` (plan caching)
- Modify: `rust_scanner/src/main.rs` (output format gating)

- [ ] **Step 1: Add plan tier caching in the CLI**

On `scanrook auth login` or first scan with an API key, call `/api/cli/plan` and cache the result locally at `~/.scanrook/plan.json` with a 1-hour TTL.

```rust
// In usercli.rs or a new plan.rs module:
pub struct PlanInfo {
    pub tier: String,
    pub enrichment: EnrichmentConfig,
    pub output_formats: Vec<String>,
    pub db_tier: String,
    pub cached_at: chrono::DateTime<chrono::Utc>,
}

pub struct EnrichmentConfig {
    pub osv: bool,
    pub nvd: bool,
    pub oval: bool,
    pub epss: bool,
    pub kev: bool,
    pub distro_trackers: bool,
}

pub fn get_plan() -> PlanInfo {
    // Check cached plan file
    let plan_path = scanrook_dir().join("plan.json");
    if let Ok(contents) = std::fs::read_to_string(&plan_path) {
        if let Ok(plan) = serde_json::from_str::<PlanInfo>(&contents) {
            if plan.cached_at + chrono::Duration::hours(1) > chrono::Utc::now() {
                return plan;
            }
        }
    }

    // Fetch from API if we have an API key
    if let Some(key) = get_stored_api_key() {
        if let Ok(plan) = fetch_plan_from_api(&key) {
            let _ = std::fs::write(&plan_path, serde_json::to_string_pretty(&plan).unwrap());
            return plan;
        }
    }

    // Default: free tier
    PlanInfo::free()
}
```

- [ ] **Step 2: Wire plan into enrichment pipeline**

In `vuln/mod.rs`, before each enrichment source runs, check the plan:

```rust
// At the top of the enrichment pipeline:
let plan = crate::usercli::get_plan();

// Before NVD enrichment:
if !plan.enrichment.nvd {
    progress("nvd.skip", "upgrade to Developer plan for NVD enrichment");
} else {
    // existing NVD enrichment code
}

// Before EPSS:
if !plan.enrichment.epss {
    progress("epss.skip", "upgrade to Developer plan for EPSS scoring");
}

// Before OVAL:
if !plan.enrichment.oval {
    progress("oval.skip", "upgrade to Team plan for Red Hat OVAL evaluation");
}
```

- [ ] **Step 3: Gate output format**

In `main.rs`, when the user specifies `--format json`:

```rust
let plan = crate::usercli::get_plan();
if format == "json" && !plan.output_formats.contains(&"json".to_string()) {
    eprintln!("JSON output requires a Developer plan or higher. Run `scanrook auth login` to authenticate.");
    eprintln!("Upgrade at https://scanrook.io/pricing");
    std::process::exit(1);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/usercli.rs src/vuln/mod.rs src/main.rs
git commit -m "feat: enforce plan tier in CLI enrichment pipeline

Free tier: OSV only, text output.
Developer: +NVD, +EPSS, +KEV, +JSON output.
Team/Enterprise: +OVAL, +distro trackers, full DB."
```

---

## Phase 2C: Stripe Integration

### Task 6: Add plan_tier to organizations schema

**Files:**
- Modify: `scanrook-ui/src/lib/prisma.ts` (schema bootstrap SQL)

- [ ] **Step 1: Add plan_tier column and Stripe fields to organizations**

In `ensurePlatformSchema()`, add to the organizations table creation:

```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'FREE';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_seats INTEGER NOT NULL DEFAULT 1;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_period_end TIMESTAMPTZ;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/prisma.ts
git commit -m "feat: add plan_tier and Stripe fields to organizations schema"
```

### Task 7: Wire up Stripe checkout

**Files:**
- Modify: `scanrook-ui/src/app/api/billing/checkout/route.ts`
- Modify: `scanrook-ui/src/app/api/billing/webhook/route.ts`
- Modify: `scanrook-ui/src/app/api/billing/portal/route.ts`

- [ ] **Step 1: Implement checkout session creation**

```typescript
// POST /api/billing/checkout
// Body: { plan: "DEVELOPER" | "TEAM" | "ENTERPRISE", seats?: number }

const priceIds: Record<string, string> = {
  DEVELOPER: process.env.STRIPE_PRICE_DEVELOPER!,
  TEAM: process.env.STRIPE_PRICE_TEAM!,
};

const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  customer: org.stripe_customer_id || undefined,
  customer_email: org.stripe_customer_id ? undefined : user.email,
  line_items: [{
    price: priceIds[plan],
    quantity: plan === "TEAM" ? (seats || 5) : 1,
  }],
  success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
  cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
  metadata: { org_id: org.id, plan },
});
```

- [ ] **Step 2: Implement webhook handler for subscription events**

Handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

```typescript
case "checkout.session.completed": {
  const orgId = session.metadata.org_id;
  const plan = session.metadata.plan;
  await prisma.$executeRaw`
    UPDATE organizations SET
      plan_tier = ${plan},
      stripe_customer_id = ${session.customer},
      stripe_subscription_id = ${session.subscription},
      plan_period_end = ${new Date(session.expires_at * 1000)}
    WHERE id = ${orgId}::uuid
  `;
  break;
}

case "customer.subscription.deleted": {
  // Downgrade to free
  await prisma.$executeRaw`
    UPDATE organizations SET plan_tier = 'FREE', stripe_subscription_id = NULL
    WHERE stripe_subscription_id = ${subscription.id}
  `;
  break;
}
```

- [ ] **Step 3: Implement billing portal redirect**

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: org.stripe_customer_id,
  return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
});
return NextResponse.json({ url: portalSession.url });
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/billing/checkout/route.ts src/app/api/billing/webhook/route.ts src/app/api/billing/portal/route.ts
git commit -m "feat: wire up Stripe checkout, webhooks, and billing portal

Handles subscription creation, plan changes, and cancellation.
Updates org plan_tier on successful checkout."
```

### Task 8: Update billing dashboard page

**Files:**
- Modify: `scanrook-ui/src/app/(dashboard)/dashboard/billing/page.tsx`

- [ ] **Step 1: Replace "coming soon" with actual plan display and upgrade buttons**

Show current plan, usage, and upgrade/manage buttons. If on free plan, show comparison table with upgrade CTAs. If on paid plan, show "Manage Subscription" button that redirects to Stripe billing portal.

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/dashboard/billing/page.tsx
git commit -m "feat: billing page with plan display and Stripe upgrade flow"
```

---

## Phase 2D: Pricing Page Update

### Task 9: Update pricing page with new tiers

**Files:**
- Modify: `scanrook-ui/src/app/pricing/page.tsx`

- [ ] **Step 1: Update the pricing page to reflect the 4-tier model**

| Free | Developer ($15/dev/mo) | Team ($40/dev/mo, min 5) | Enterprise (custom) |
|------|----------------------|------------------------|-------------------|
| OSV enrichment | +NVD, EPSS, KEV | +OVAL, distro trackers | Everything |
| Text output | +JSON, NDJSON | +Web dashboard | +SSO/SAML |
| CLI only | +Free vulndb | +Full vulndb | +Self-hosted |
| | +SBOM workflows | +CI/CD gates | +Compliance reports |
| | 1 seat | +Registries, notifications | +Audit logging |
| | | 5+ seats | Unlimited |

- [ ] **Step 2: Add Stripe checkout links to upgrade buttons**

- [ ] **Step 3: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat: update pricing page with Developer/Team/Enterprise tiers"
```

---

## Verification

- [ ] **End-to-end test: Free tier user**
  - No API key → `scanrook db fetch` downloads free DB
  - `scanrook scan --file image.tar` → only OSV enrichment runs
  - `scanrook scan --format json` → rejected with upgrade message

- [ ] **End-to-end test: Paid tier user**
  - `scanrook auth login` → authenticates, caches plan
  - `scanrook db fetch` → downloads full DB
  - `scanrook scan --file image.tar` → all enrichment sources run
  - `scanrook scan --format json` → works

- [ ] **End-to-end test: Stripe flow**
  - Sign up → free org created
  - Go to /dashboard/billing → see free plan
  - Click upgrade → Stripe checkout
  - Complete payment → org plan_tier updated
  - CLI fetches new plan → enrichment unlocked

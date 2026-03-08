# SBOM Feature Design

**Date:** 2026-03-08
**Status:** Approved
**Approach:** Scanner-Centric (all SBOM logic in Rust scanner)

---

## Summary

Full SBOM lifecycle for ScanRook: import, export, diff, policy gates, and visualization. All format parsing, conversion, diff, and policy evaluation happens in the Rust scanner. The Go worker orchestrates post-scan SBOM generation. The UI provides a dedicated SBOM section plus integration into the existing scan detail pages.

---

## Section 1: SBOM Import

Users upload SBOM files (CycloneDX, SPDX, Syft JSON) through the existing upload flow.

**Worker change:** In `runner.go`, after downloading the file, detect if it's an SBOM by checking for `bomFormat`, `spdxVersion`, or `artifacts` keys in the JSON. If SBOM, call `scanrook sbom import --file <path>` instead of `scanrook scan --file <path>`. Report output is identical in structure (findings, summary, packages) so the ingestion pipeline stays the same.

**UI change:** `UploadCard` accepts SBOM files (`.cdx.json`, `.spdx.json`, `.json`). Scan dashboard shows an "SBOM" badge on the job card when `target.type === "sbom"`.

**API:** Existing flow works — `POST /api/uploads/presign` → upload → `POST /api/scan/from-s3` → worker picks it up. API key auth already works.

---

## Section 2: SBOM Export

After any scan completes, three SBOM formats are generated automatically as a non-blocking post-processing step.

**Worker flow:**
1. Scan completes → job status set to `done` → SSE notifies browser (existing, unchanged)
2. Worker runs `scanrook sbom export` three times (CycloneDX, SPDX, Syft)
3. Uploads to S3: `reports/<job-id>/sbom.cdx.json`, `sbom.spdx.json`, `sbom.syft.json`
4. Updates `sbom_status` column on `scan_jobs` from `pending` → `ready`
5. Inserts `scan_event` with stage `sbom_export_complete` → triggers `pg_notify` → SSE pushes to browser

If SBOM generation fails, `sbom_status` = `failed`. Scan results are unaffected.

**Scanner change:** New `sbom export` subcommand that takes a report JSON and outputs CycloneDX/SPDX/Syft. Includes dependency relationship data for graph visualization.

**API routes:**
- `GET /api/jobs/[id]/sbom?format=cyclonedx|spdx|syft` — presigned S3 URL for download
- `GET /api/jobs/[id]/sbom/summary` — package stats, ecosystem breakdown, dependency tree data

**UI — SBOM tab on job detail page:**
- **Loading state:** While `sbom_status === 'pending'`, spinner with "Generating SBOMs..." SSE event flips to ready.
- **Stats panel:** Total packages, ecosystem breakdown chart, generation timestamp, format badges
- **Package table:** Sortable/filterable — name, version, ecosystem, PURL, license
- **Dependency graph:** Interactive visualization (see Section 6)
- **Download buttons:** CycloneDX, SPDX, Syft — download pre-generated files from S3

---

## Section 3: SBOM Diff & Baseline Tracking

All baselines and diffs are org-scoped. No cross-org data leakage.

**Automatic baselines:**
1. After SBOM generation, worker queries `scan_jobs` for the previous completed scan with the same `original_filename` within the same org
2. If previous scan exists, downloads both reports and runs `scanrook sbom diff --baseline <prev> --current <new> --json --out diff.json`
3. Uploads diff to S3: `reports/<job-id>/sbom-diff.json`
4. Stores diff summary in `sbom_diff_summary` JSONB column on `scan_jobs`
5. Inserts `scan_event` with stage `sbom_diff_complete` → SSE notification

**Manual comparison:**
- `POST /api/jobs/compare` — accepts `{ baseline_job_id, current_job_id }`, org-scoped
- `GET /api/jobs/[id]/sbom/diff` — returns diff JSON

**UI — Diff view on job detail SBOM tab:**
- "Changes from baseline" section with summary badges: +N added, -N removed, N changed
- Color-coded table: green (added), red (removed), yellow (version changes)
- Each row shows vulnerability impact (e.g., "openssl 3.0.7→3.0.10: -4 CVEs")

**UI — Compare page (dedicated SBOM section):**
- Two dropdown selectors for baseline and current scan (org-filtered)
- Compare button, inline results

---

## Section 4: Policy Gates

Org-level policies that evaluate SBOM diffs. Used in the UI (dashboard alerts) and via API (CI/CD).

**DB schema — `sbom_policies` table:**
- `id` UUID PK
- `org_id` UUID FK → orgs
- `name` TEXT
- `rules` JSONB: `{ max_new_critical, max_new_high, deny_list[], block_removed, block_kev }`
- `is_default` BOOLEAN — auto-applied to every new scan diff in this org
- `created_by` UUID FK → users
- `created_at`, `updated_at`

**DB schema — `policy_checks` table:**
- `id` UUID PK
- `org_id` UUID FK
- `job_id` UUID FK → scan_jobs
- `policy_id` UUID FK → sbom_policies
- `passed` BOOLEAN
- `violations` JSONB
- `checked_at` TIMESTAMPTZ

**Automatic evaluation:** After SBOM diff, worker checks for org default policy. If exists, runs `scanrook sbom policy` and stores result. SSE event with stage `policy_check_complete`.

**API routes:**
- CRUD: `GET/POST /api/org/policies`, `PUT/DELETE /api/org/policies/[id]` (requires `ROLE_POLICY_ADMIN`)
- CI/CD: `POST /api/jobs/[id]/policy-check` — accepts `{ policy_id }` or uses org default. Returns `{ passed, violations[] }`
- Results: `GET /api/jobs/[id]/policy-result`

**UI — Policy management on org settings page (`/dashboard/settings/org`):**
- New "Policies" section alongside API keys, members, billing
- Create/edit form: sliders for severity thresholds, text inputs for deny list patterns, toggles for block_removed and block_kev
- Set one policy as default

**UI — Job detail integration:**
- Pass/fail badge on job card and detail page
- Failed checks show violations list

---

## Section 5: Dedicated SBOM Page

New top-level page at `/dashboard/sbom` with nav link between "Dashboard" and "API Keys".

**Tab 1: Overview**
- Org-wide SBOM stats: total scans with SBOMs, total unique packages, ecosystem distribution chart
- Recent policy check results (last 10) with pass/fail badges
- Targets with baselines: unique targets with latest scan date and package count

**Tab 2: Compare**
- Two dropdown selectors (org-filtered), optional target name filter
- Compare button → `POST /api/jobs/compare`
- Inline results: summary badges + color-coded diff table + vulnerability impact
- Download diff as JSON

**Tab 3: Policies**
- Read-only view of active org policies
- Policy check history table: job name, policy name, pass/fail, date, violations
- "Manage Policies" link → org settings page
- Filter: passed / failed / all

---

## Section 6: Dependency Graph Visualization

Interactive package dependency graph on the SBOM tab of the job detail page.

**Data source:** CycloneDX `dependencies[]` array. Scanner populates from detected dependency manifests (package-lock.json, go.sum, Cargo.lock, etc.).

**Library:** `react-force-graph-2d`

**Graph behavior:**
- Nodes = packages, sized by dependency count
- Node color = ecosystem (npm green, pip blue, cargo orange, etc.)
- Edges = dependency relationships
- Click node → side panel with package details (name, version, PURL, vulnerabilities, license)
- Nodes with vulnerabilities get a red ring
- Search bar, ecosystem filter toggles, zoom-to-fit button

**Fallback:** No dependency data → grid/cluster layout grouped by ecosystem. Still interactive.

**Performance:** 500+ packages → default to table view with "View dependency graph" button for lazy loading.

---

## Phasing Recommendation

1. **Phase 1:** SBOM Import + Export (worker dispatch + scanner `sbom export` subcommand + S3 storage + API routes + download UI)
2. **Phase 2:** SBOM tab UI (stats panel + package table + download buttons + SSE integration)
3. **Phase 3:** Diff & Baselines (automatic baseline tracking + manual compare + diff UI)
4. **Phase 4:** Policy Gates (DB schema + worker evaluation + API + org settings UI)
5. **Phase 5:** Dedicated SBOM page (overview + compare + policies tabs)
6. **Phase 6:** Dependency Graph (scanner dependency extraction + react-force-graph-2d visualization)

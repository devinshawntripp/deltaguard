# Roadmap: ScanRook v1.10.0 — Stabilization & Polish

## Overview

This milestone stabilizes and polishes the existing three-tier ScanRook platform. The work flows in dependency order: fix the database time bomb first (scan_events retention), harden the UI and fix known bugs, complete the scanner v1.8 refactor and add DMG support, harden the Go worker around the improved scanner, deploy everything to the cluster as a unified v1.10.0 release, then lock in regression protection with Playwright E2E tests and publish documentation and benchmark results.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Infrastructure Stabilization** - Stop the scan_events table from growing unbounded and stabilize the database foundation (completed 2026-03-03)
- [x] **Phase 2: UI Bug Fixes** - Fix all known visual bugs and restore mobile usability (completed 2026-03-03)
- [ ] **Phase 3: Log Viewer Rework** - Make large scans (47k+ events) viewable without crashing the browser
- [x] **Phase 4: Scanner Hardening** - Complete the v1.8 refactor, add DMG support, and release v1.10.0
- [x] **Phase 5: Worker Hardening** - Add circuit breaker, fix pool sizing, and verify Python script integrity (completed 2026-03-04)
- [ ] **Phase 5.1: Scanner DB Fetch Fix** - INSERTED — Fix format mismatch: scanner expects gzip but CronJob uploads raw SQLite
- [ ] **Phase 5.2: UI Navigation Regressions** - INSERTED — Fix Home redirect loop and install link auth redirect
- [ ] **Phase 6: Cluster Deployment** - Deploy the full updated stack to Kubernetes and verify the release
- [ ] **Phase 7: Testing, Docs & Benchmarks** - Playwright E2E suite, CPE docs, blog sidebar, and final benchmarks

## Phase Details

### Phase 1: Infrastructure Stabilization
**Goal**: The database is stable and bounded — scan_events cannot exhaust cluster storage, SSE connections do not leak, and S3 keys cannot collide
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01
**Success Criteria** (what must be TRUE):
  1. A retention policy on scan_events exists and is active — old events are deleted automatically on a defined schedule
  2. The scan_events table size is observable (query returns pg_size_pretty value) and does not grow without bound
  3. The SSE events route uses the singleton connection pool (ssePool.ts) — confirmed by code inspection and no per-request pg.Client instantiation
**Plans**: 2 plans
Plans:
- [ ] 01-01-PLAN.md — pg_cron retention policy + observability + static analysis test
- [ ] 01-02-PLAN.md — SSE route refactor to use jobEventsBus (eliminate pg.Client leak)

### Phase 2: UI Bug Fixes
**Goal**: Every visible UI bug in the dashboard, pipeline component, mobile navbar, and docs auth state is fixed
**Depends on**: Nothing (can run in parallel with Phase 1)
**Requirements**: UIBF-01, UIBF-02, UIBF-03, UIBF-04
**Success Criteria** (what must be TRUE):
  1. The ScanRook Pipeline component renders all pipeline stages without horizontal overflow at any viewport width
  2. Scan event badges on the job detail page wrap to a new line instead of overflowing their container
  3. On a mobile viewport (375px), the navbar collapses to a hamburger menu that opens a drawer with navigation links
  4. A user who is already signed in visiting /docs sees no sign-in button — the navbar reflects authenticated state correctly
**Plans**: 2 plans
Plans:
- [x] 02-01-PLAN.md — Pipeline scroll strip + badge wrap/collapse (UIBF-01, UIBF-02)
- [x] 02-02-PLAN.md — Mobile navbar hamburger menus + auth-aware public nav (UIBF-03, UIBF-04)

### Phase 3: Log Viewer Rework
**Goal**: Users can view and navigate scan logs for any scan size including 47k+ events without browser freeze or tab crash
**Depends on**: Phase 1 (stable schema before adding pagination layer)
**Requirements**: LOGV-01, LOGV-02, LOGV-03
**Success Criteria** (what must be TRUE):
  1. Scan events are grouped by stage in collapsible accordion sections showing a count per stage — user can expand or collapse each section
  2. Loading a job with 47k events does not cause a DOM freeze or tab crash — only visible rows are rendered in the DOM at any time
  3. Consecutive repeated events of the same type are collapsed into a single summary row showing repetition count
**Plans**: 3 plans
Plans:
- [x] 03-01-PLAN.md — Foundation: install @tanstack/react-virtual, fix test path, create regression tests, add stage_filter API
- [x] 03-02-PLAN.md — Core rework: ProgressGraph accordion shell + StageAccordionSection with virtualizer + RLE + live scan behavior
- [x] 03-03-PLAN.md — Logs route + expand-to-fill toggle + compact dashboard inline + visual verification

### Phase 4: Scanner Hardening
**Goal**: The Rust scanner completes the v1.8 refactor (phases 3-6), correctly identifies and scans DMG files, and is released as v1.10.0
**Depends on**: Nothing (can run in parallel with Phases 1-3)
**Requirements**: SCAN-01, SCAN-02, SCAN-03
**Success Criteria** (what must be TRUE):
  1. RHEL/Rocky consolidation and all remaining v1.8 refactor modules are merged and the scanner compiles cleanly
  2. A macOS DMG file submitted for scanning returns extracted package data instead of zero packages
  3. Running `scanrook --version` (or `scanner --version`) outputs `1.10.0` and the GitHub release tag v1.10.0 exists with attached binaries
**Plans**: 6 plans
Plans:
- [x] 04-01-PLAN.md — RHEL/Rocky consolidation: post-enrichment dedup + RHEL-version CPE gating + unit tests
- [x] 04-02-PLAN.md — DMG .app/.pkg detection + dmgwiz extraction + multi-format reliability
- [x] 04-03-PLAN.md — Unit tests: version comparison, CPE matching, OVAL evaluation, package parsing (QUAL-02-05)
- [x] 04-04-PLAN.md — Version bump to 1.10.0 + CHANGELOG + README + release.yml update
- [ ] 04-05-PLAN.md — Gap closure: DMG extraction documentation + fallback chain tests (SCAN-01)
- [ ] 04-06-PLAN.md — Gap closure: Create v1.10.0 git tag + trigger GitHub release (SCAN-01)

### Phase 5: Worker Hardening
**Goal**: The Go worker handles scanner failures gracefully, sizes its connection pool correctly, and all supporting scripts are verified intact
**Depends on**: Phase 4 (circuit breaker calibration requires consistent scanner exit codes)
**Requirements**: WORK-01, WORK-02, WORK-03
**Success Criteria** (what must be TRUE):
  1. When the scanner binary fails repeatedly, the circuit breaker opens and subsequent jobs are marked failed fast without retrying the scanner — visible in job status and logs
  2. The worker's PostgreSQL connection pool size is explicitly set based on WORKER_CONCURRENCY and does not default to an unbounded or undersized value
  3. Python scripts in the Next.js project execute without errors against the updated database schema — verified by running each script and observing clean output
**Plans**: 2 plans
Plans:
- [ ] 05-01-PLAN.md — Circuit breaker around scanner exec + explicit PostgreSQL pool sizing (WORK-01, WORK-02)
- [ ] 05-02-PLAN.md — Python vulndb-pg-import.py verification (WORK-03)

### Phase 5.1: Scanner DB Fetch Fix
**Goal**: The `scanrook db fetch` command correctly handles the vulndb SQLite file regardless of compression format
**Depends on**: Phase 5 (CronJob verified uploading raw SQLite)
**Requirements**: SCAN-04
**Gap Closure:** Closes audit gap — scanner CLI cannot fetch its own vulnerability database
**Success Criteria** (what must be TRUE):
  1. `scanrook db fetch` downloads and opens the vulndb SQLite file without errors — auto-detects gzip vs raw SQLite by checking magic bytes
  2. The scanner can query the fetched database for vulnerability lookups after download
**Plans**: TBD

### Phase 5.2: UI Navigation Regressions
**Goal**: Public site navigation works correctly for both authenticated and unauthenticated users without unexpected redirects
**Depends on**: Phase 2 (original UI bug fixes)
**Requirements**: UINV-01, UINV-02
**Gap Closure:** Closes audit gap — navigation regressions reported by user
**Success Criteria** (what must be TRUE):
  1. An authenticated user clicking nav links on /docs stays on public pages — no redirect to /dashboard unless explicitly navigating there
  2. The "Install" nav link navigates to its target without being intercepted by auth redirects
  3. The "Home" link from docs does not redirect authenticated users to /dashboard
**Plans**: 1 plan
Plans:
- [ ] 05.2-01-PLAN.md — Remove home page auth redirect + conditional CTA + public page audit

### Phase 6: Cluster Deployment
**Goal**: The updated scanner, worker, and database changes are deployed to the Kubernetes cluster and the v1.10.0 release is verified running in production
**Depends on**: Phases 1, 4, 5 (all backend changes must be complete before deployment)
**Requirements**: INFR-02, INFR-03
**Success Criteria** (what must be TRUE):
  1. New worker and scanner images are deployed to the deltaguard namespace — `kubectl rollout status` reports all pods healthy
  2. Running `kubectl exec` against a worker pod and invoking the scanner binary outputs `1.10.0` — version skew confirmed absent
  3. A real scan job submitted via the UI completes end-to-end (upload → progress stream → findings) without errors in a post-deployment smoke test
**Plans**: TBD

### Phase 7: Testing, Docs & Benchmarks
**Goal**: Critical user paths are protected by Playwright E2E tests, CPE documentation is published, the blog sidebar is live, and end-to-end benchmarks confirm no regressions
**Depends on**: Phase 6 (E2E tests must run against deployed, stable infrastructure; benchmarks measure production behavior)
**Requirements**: TEST-01, TEST-02, BNCH-01, DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. `npx playwright test` passes with tests covering: upload flow, scan progress stream, findings page filters, and auth sign-in/sign-out — all using fixture data, not live scanner
  2. `/docs/cpe` is live and explains the CPE format, how ScanRook uses CPEs, and the CPE-to-CVE lookup process
  3. Blog post pages show a related content sidebar linking to posts with matching tags
  4. The `/home` route is removed — navigating to it redirects to `/install` — and no duplicate landing page content exists
  5. End-to-end benchmark run completes without performance regressions compared to pre-milestone baseline
**Plans**: 4 plans
Plans:
- [ ] 07-01-PLAN.md — Playwright E2E setup + tests for upload, progress, findings, auth (TEST-01, TEST-02)
- [ ] 07-02-PLAN.md — CPE docs page with interactive parser widget + docs audit + /home verification (DOCS-01, DOCS-03)
- [ ] 07-03-PLAN.md — Blog related content sidebar by category (DOCS-02)
- [ ] 07-04-PLAN.md — Scanner benchmarks run + update docs/blog benchmark data (BNCH-01)

## Progress

**Execution Order:**
Phases execute in dependency order: 1 → 2 → 3 (waits for 1) → 4 → 5 (waits for 4) → 6 (waits for 1, 4, 5) → 7 (waits for 6)
Note: Phase 2 can begin immediately. Phases 1, 2, and 4 can run in parallel where resources allow.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure Stabilization | 2/2 | Complete   | 2026-03-03 |
| 2. UI Bug Fixes | 2/2 | Complete    | 2026-03-03 |
| 3. Log Viewer Rework | 3/3 | Complete | 2026-03-03 |
| 4. Scanner Hardening | 4/6 | In progress | 2026-03-04 |
| 5. Worker Hardening | 2/2 | Complete   | 2026-03-04 |
| 5.1 Scanner DB Fetch Fix | 0/TBD | Not started | - |
| 5.2 UI Navigation Regressions | 0/1 | Not started | - |
| 6. Cluster Deployment | 0/TBD | Not started | - |
| 7. Testing, Docs & Benchmarks | 2/4 | In Progress|  |

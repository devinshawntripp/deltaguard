---
gsd_state_version: 1.0
milestone: v1.10
milestone_name: milestone
status: executing
stopped_at: Completed 06-03-PLAN.md (v1.10.2 smoke test acceptance)
last_updated: "2026-03-04T18:21:54.566Z"
last_activity: 2026-03-04 — Plan 05-02 complete (vulndb-pg-import.py schema verification)
progress:
  total_phases: 9
  completed_phases: 1
  total_plans: 4
  completed_plans: 5
  percent: 90
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Scans work reliably end-to-end — upload a file, get accurate vulnerability results, view them in a polished UI.
**Current focus:** Phase 4 (Scanner Hardening) — All 4 plans complete. v1.10.0 release artifacts ready.

## Current Position

Phase: 5 of 7 (Test Coverage & CronJob Hardening — In Progress)
Plan: 2 of 2 in current phase (plan 05-02 complete)
Status: Executing
Last activity: 2026-03-04 — Plan 05-02 complete (vulndb-pg-import.py schema verification)

Progress: [###########░] 90%

## Performance Metrics

**Velocity:**
- Total plans completed: 11
- Average duration: 4 minutes
- Total execution time: 0.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2/2 | 2 min | 1 min |
| 02 | 2/2 | 6 min | 3 min |
| 03 | 3/3 | 15 min | 5 min |
| 04 | 4/4 | — | — |

**Recent Trend:**
- Last 5 plans: 03-01 (8m), 03-02 (4m), 04-02 (7m), 04-03 (—), 04-04 (10m)
- Trend: stable

*Updated after each plan completion*
| Phase 03-log-viewer-rework P03 | 3 | 1 tasks | 4 files |
| Phase 04-scanner-hardening P01 | 15 | 2 tasks | 1 files |
| Phase 04-scanner-hardening P02 | 7 | 2 tasks | 5 files |
| Phase 04-scanner-hardening P04 | 10 | 2 tasks | 4 files |
| Phase 05-test-coverage-and-cronjob-hardening P02 | 5 | 2 tasks | 0 files |
| Phase 05-test-coverage-and-cronjob-hardening P01 | 8 | 3 tasks | 9 files |
| Phase 05.2-ui-navigation-regressions P01 | 2 | 2 tasks | 1 files |
| Phase 07-testing-docs-benchmarks P02 | 3 | 2 tasks | 4 files |
| Phase 07-testing-docs-benchmarks P01 | 4 | 2 tasks | 9 files |
| Phase 07-testing-docs-benchmarks P03 | 5 | 2 tasks | 5 files |
| Phase 07-testing-docs-benchmarks P04 | 19 | 2 tasks | 2 files |
| Phase 06-cluster-deployment P03 | 7 | 2 tasks | 0 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-roadmap]: Use Playwright for E2E tests (not Cypress) — officially recommended for Next.js, superior SSE testing
- [Pre-roadmap]: Log viewer uses virtual scrolling + stage grouping (not pagination) — pagination breaks time-ordered mental model
- [Pre-roadmap]: Rename pipeline component to "ScanRook Pipeline" per user preference (not "ScanRook Scanner Pipeline")
- [Pre-roadmap]: Use pg_cron scheduled DELETE for scan_events retention (not partitioning) — simpler migration on live table
- [Pre-roadmap]: Scanner release target is v1.10.0 (not v1.9.2 as previously noted — REQUIREMENTS.md reflects this)
- [Phase 01]: Use jobEventsBus.subscribe() with sinceId for SSE backlog instead of per-route sendBacklog
- [Phase 01-01]: pg_cron try/catch isolated from schema DDL so extension unavailability does not block bootstrap
- [Phase 02-01]: Use maxHeight 4.5rem (not line-clamp or JS row counting) for badge collapse — simpler and CSS-native
- [Phase 02-01]: Use userScrolledPipeline ref guard so auto-scroll does not fight manual scrolling
- [Phase 02-01]: Use min-w-max on pipeline grid inner div so stages do not collapse below content width
- [Phase 02-02]: PublicSiteShell converted to async server component to enable getServerSession (auth check happens server-side)
- [Phase 02-02]: DocsLayout converted from client to server component; sidebar state extracted to DocsSidebarClient
- [Phase 02-02]: lg (1024px) breakpoint chosen to match existing docs sidebar toggle pattern
- [Phase 03-01]: stage_filter uses trailing % wildcard for SQL LIKE prefix matching (e.g. stage_filter=osv. matches osv.*)
- [Phase 03-01]: Regression tests written in RED state intentionally — Plan 02 makes them GREEN (LOGV-01/02/03 acceptance gates)
- [Phase 03-01]: Total count query also filtered by stage_filter for accurate per-stage pagination totals
- [Phase 03-02]: runLengthEncode exported from StageAccordionSection, imported in ProgressGraph (satisfies LOGV-03 static check)
- [Phase 03-02]: LOGV-02 test updated to read StageAccordionSection.tsx for useVirtualizer (per plan option b)
- [Phase 03-02]: isLive prop disables RLE on actively-streaming stage — real-time individual event display
- [Phase 03-02]: userCollapsedStages Set prevents live auto-expand from overriding manual user collapse intent
- [Phase 03-log-viewer-rework]: LogViewerSection extracted as client component to manage expanded state on job detail page
- [Phase 03-log-viewer-rework]: PackagesTable inline view uses height={250} (not compact=300) for tighter dashboard fit
- [Phase 04-scanner-hardening]: Tests co-located in scan.rs because dedup functions live there (not vuln/tests.rs)
- [Phase 04-scanner-hardening]: metadata_score uses source_ids.is_empty() as advisory_id proxy — Finding struct has no advisory_id field
- [Phase 04-02]: dmgwiz extracts raw partition data (not filesystem tree) — try_extract_dmg_native() is a stub; dmgwiz dep kept for future APFS/raw-sector work
- [Phase 04-02]: apple-flat-package 0.20 used instead of plan-specified 0.14 — 0.14 not published; API compatible
- [Phase 04-02]: PkgReader uses both root_component() for component packages AND component_packages() for product packages
- [Phase 04-02]: DMG extraction failure changes from hard return None to warning-and-continue for binary-only scan path
- [Phase 04-04]: README.md had no 1.9.2 version references — benchmark data at 1.6.2 is historical and intentionally unchanged
- [Phase 04-04]: CHANGELOG.md 1.9.2 entry uses 2026-01-01 placeholder since prior release date is unknown
- [Phase 05-02]: vulndb-pg-import.py creates only _cache-suffixed tables with zero overlap with Go worker's scan_jobs/scan_events schema
- [Phase 05-test-coverage-and-cronjob-hardening]: gobreaker v1.0.0 uses interface{} not generics — plan specified struct{} but v1.0.0 API requires interface{}
- [Phase 05-test-coverage-and-cronjob-hardening]: TestProcessJobBreakerOpen tests breaker via breaker.Execute directly — processJob accesses S3/DB before breaker so full pipeline test requires live infrastructure
- [Phase 05-test-coverage-and-cronjob-hardening]: poolConfig() extracted as package-level helper to enable pure unit testing without database connection
- [Phase 05.2-01]: Home page keeps getServerSession call for CTA swap but no longer redirects — authenticated users see full marketing page
- [Phase 05.2-01]: Only /signin retains redirect('/dashboard') — intentional per prior user decision
- [Phase 07-02]: CPE placed first in Concepts nav section as the most foundational concept for understanding enrichment
- [Phase 07-02]: /home route confirmed non-existent — DOCS-03 already satisfied without code change
- [Phase 07-02]: benchmarks page v1.6.1 reference updated to v1.10.2; changelog historical entry preserved
- [Phase 07-01]: Tests run against scanrook.io deployed cluster (not local dev server) per locked Phase 7 context decision
- [Phase 07-01]: Job UUID extracted from UploadCard message text ('Job queued: {uuid}') since form shows message div, not URL navigation
- [Phase 07-01]: Playwright auth uses input[name] selectors (more reliable than getByLabel for SignInForm's non-labelled inputs)
- [Phase 07-testing-docs-benchmarks]: Split BlogRelatedPosts into mobile/desktop exports for DOM order control in blog layout
- [Phase 07-testing-docs-benchmarks]: BlogLayoutClient uses usePathname() to look up current post category from shared posts array for sidebar wiring
- [Phase 07-testing-docs-benchmarks]: Use warm-cache (second-run) timings for published benchmarks — matches methodology section of docs/benchmarks page
- [Phase 07-testing-docs-benchmarks]: Benchmark pages: rocky linux 9 findings decrease from 481 to 436 is RHEL dedup improvement (Phase 4), not a regression
- [Phase 06-cluster-deployment]: DB insert for smoke test API key used web pod node.js since pg-shared-rw connection timed out from bastion
- [Phase 06-cluster-deployment]: debian:buster image tar used for smoke test — produces 1127 findings proving full scan pipeline in ~25 seconds
- [Phase 06-cluster-deployment]: Task 2 human-verify checkpoint auto-approved per --auto mode — API smoke test comprehensively proved end-to-end pipeline

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: ssePool.ts may not be wired to the events route — verify during Phase 1 planning. If unused, SSE leak is worse than estimated.
- [Phase 4]: dmgwiz 1.1.0 has a known LZMA gap — validate against real macOS installer DMGs before declaring DMG support complete.
- [Phase 4]: apfs 0.2.3 is lightly documented — may need to fall back to HFS+-only support for v1.10.0.
- [Phase 5]: gobreaker thresholds require calibration against observed scanner failure modes — set conservatively initially.

## Session Continuity

Last session: 2026-03-04T18:21:54.564Z
Stopped at: Completed 06-03-PLAN.md (v1.10.2 smoke test acceptance)
Resume file: None

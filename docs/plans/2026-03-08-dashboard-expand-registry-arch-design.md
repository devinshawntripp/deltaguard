# Design: Dashboard Expand Row + Registry Fix + Architecture Docs

**Date:** 2026-03-08
**Status:** Approved

---

## Area 1: Full Job Detail View in Expand Row

### Goal
Replace the basic static expand row in PackagesTable with the full `JobDetailTabs` component (Dashboard + Findings + Threat tabs) with live SSE updates.

### Current State
- `PackagesTable.tsx` expand row shows: static progress bar, severity badges, error message, 2 action links
- No SSE subscription — data is static from the initial page load
- `JobDetailTabs.tsx` already implements full SSE-based live status tracking with 3 tabs

### Design
- When user expands a row, render `<JobDetailTabs>` with the job's data
- `JobDetailTabs` already handles:
  - SSE subscription via `openSse(/api/jobs/{id}/events)`
  - Live status tracking (queued → running → done/failed)
  - Tab management (Dashboard, Findings, Threat)
  - `ScanDashboardView`: segment bar (Download/Scan/Enrich/Report), circular progress ring, elapsed timer, severity counters
  - `ScanFindingsView`: live findings preview
  - `ScanThreatView`: threat analysis (enabled when done)
- May need to adapt `JobDetailTabs` props — currently receives data from `page.tsx` server component. The expand row has job data from the table's SWR/SSE feed instead.
- SSE connection lifecycle: open on expand, close on collapse (via `openSse` unsubscribe)

### Key Files
- `src/components/PackagesTable.tsx` — replace expand row content
- `src/components/JobDetailTabs.tsx` — embed in expand row
- `src/components/ScanDashboardView.tsx` — dashboard tab (already built)
- `src/components/ScanFindingsView.tsx` — findings tab (already built)
- `src/components/ScanThreatView.tsx` — threat tab (already built)
- `src/lib/ssePool.ts` — SSE connection pool (already built)
- `src/lib/workflowStages.ts` — stage mapping (already built)

---

## Area 2: Fix Registry-Puller in Go Worker

### Goal
Fix why `nginx:latest` registry scans fail with "failed to get artifact size: The specified key does not exist."

### Root Cause Analysis
The K8s scan Job has a `registry-puller` init container that:
1. Pulls the image from the registry
2. Writes it as a tar to `/scratch/{jobId}/image.tar`
3. Uploads to S3 at `registry-pulls/{jobId}/image.tar`

If the init container fails, the S3 key never exists, and the main scan container gets a confusing "key does not exist" error.

### Investigation Plan
1. Check init container logs for the failed job on the cluster
2. Verify proxy env vars are propagated to Job pods (likely missing)
3. Check init container resource limits
4. Fix root cause in `jobbuilder.go`

### Key Files
- `rust-scanner-worker/internal/dispatcher/jobbuilder.go` — Job manifest builder (init container spec)
- `rust-scanner-worker/cmd/registry-puller/main.go` — init container binary
- `rust-scanner-worker/internal/registry/pull.go` — image pull logic
- `rust-scanner-worker/internal/dispatcher/dispatcher.go` — job reconciliation

---

## Area 3: Architecture Docs + Sidebar Fixes

### Sidebar Fixes
- Add "Scan Status" page to concepts section in `layout.tsx` navItems
- Add "Vulnerability Database" page to concepts section in `layout.tsx` navItems
- Add breadcrumb labels for both pages

### New Architecture Page
Create `src/app/docs/architecture/page.tsx` with Mermaid diagrams:

1. **Cluster Topology** — 3 nodes, namespaces, pod distribution
2. **Scan Pipeline Data Flow** — upload → queue → dispatcher → K8s Job → scan → report
3. **Component Interactions** — web ↔ DB ↔ S3 ↔ dispatcher ↔ scan pods
4. **Network Flow** — internet → Caddy edge-proxy → ingress-nginx → pods
5. **Registry Scan Flow** — image name → registry-puller init container → S3 → scan

### Key Files
- `src/app/docs/layout.tsx` — sidebar nav + breadcrumbs
- `src/app/docs/architecture/page.tsx` — new page (to create)

# Dashboard Expand Row + Registry Fix + Architecture Docs

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Embed full job detail view (tabs + SSE) in dashboard expand rows, fix registry scans by rebuilding the Go worker with current source, and add architecture docs with Mermaid diagrams.

**Architecture:** Three independent workstreams. (1) UI: replace PackagesTable expand row with JobDetailTabs component. (2) Worker: rebuild Docker image from current source, add REGISTRY_PULLER_IMAGE env var to K8s deployment. (3) Docs: add architecture page with Mermaid diagrams, fix missing sidebar links.

**Tech Stack:** Next.js/React (UI), Go (worker), Kubernetes, Mermaid (docs)

---

## Workstream A: Dashboard Expand Row with Full Job Detail View

### Task A1: Adapt JobDetailTabs for inline embedding

**Files:**
- Modify: `src/components/JobDetailTabs.tsx`
- Modify: `src/components/PackagesTable.tsx`

**Step 1: Read current JobDetailTabs props interface**

The current `Props` type requires:
```typescript
type Props = {
    scanId: string;
    jobStatus: string;
    summaryJson?: { summary?: { critical?: number; high?: number; medium?: number; low?: number; total_findings?: number }; iso_profile?: unknown; } | null;
    startedAt?: string | null;
    finishedAt?: string | null;
    displayName?: string;
    progressPct?: number;
    progressMsg?: string | null;
};
```

The PackagesTable `Job` type already has all of these fields. Map them:
- `scanId` ← `job.id`
- `jobStatus` ← `job.status`
- `summaryJson` ← `job.summary_json`
- `startedAt` ← `job.started_at`
- `finishedAt` ← `job.finished_at`
- `displayName` ← `job.object_key?.replace(/^\d+_/, "") || job.id`
- `progressPct` ← `job.progress_pct`
- `progressMsg` ← `job.progress_msg`

**Step 2: Replace expand row content in PackagesTable.tsx**

Replace the expand row content (lines 389-422) — the `{isOpen && (...)}` block — with the JobDetailTabs component. Replace the entire `<tr>` block inside `{isOpen && (...)}` with:

```tsx
{isOpen && (
  <tr className="border-t border-black/5 dark:border-white/5">
    <td className="p-0" colSpan={8}>
      <div className="px-4 py-3">
        <JobDetailTabs
          scanId={j.id}
          jobStatus={j.status}
          summaryJson={j.summary_json}
          startedAt={j.started_at}
          finishedAt={j.finished_at}
          displayName={j.object_key?.replace(/^\d+_/, "") || j.id}
          progressPct={j.progress_pct}
          progressMsg={j.progress_msg}
        />
      </div>
    </td>
  </tr>
)}
```

**Step 3: Add the import to PackagesTable.tsx**

Add at the top of the file:
```typescript
import JobDetailTabs from "./JobDetailTabs";
```

**Step 4: Verify JobDetailTabs is a client component**

Confirm `JobDetailTabs.tsx` has `"use client"` at the top. It should already since it uses `useState` and `useEffect`.

**Step 5: Test locally**

Run: `cd ~/Desktop/GitHub/scanrook/scanrook-ui && npm run dev`
- Navigate to `/dashboard`
- Expand a row — should see the full tabbed view with Dashboard/Findings/Threat tabs
- For a running job: verify SSE connects and updates live (progress ring, stage label, severity counters)
- For a completed job: verify done state shows (100%, severity bars, "View Findings")
- For a failed job: verify error message displays
- Collapse and re-expand — verify SSE disconnects and reconnects cleanly

**Step 6: Run type check**

Run: `cd ~/Desktop/GitHub/scanrook/scanrook-ui && npx tsc --noEmit`
Expected: No new errors

**Step 7: Commit**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
git add src/components/PackagesTable.tsx
git commit -m "feat: embed full job detail view with SSE in dashboard expand rows"
```

---

## Workstream B: Fix Registry Scans (Go Worker)

### Task B1: Investigate and confirm root cause on cluster

**Step 1: Verify the deployed image is stale**

The deployed `k8s-scheduler-v4` image does NOT contain the registry-skip logic that exists in the current source code. The dispatcher unconditionally calls `GetObjectSize()` for all jobs, including registry jobs where the tar doesn't exist yet (the init container hasn't run).

Additionally, `REGISTRY_PULLER_IMAGE` is not set in the dispatcher deployment, so even if the code were current, no init container would be injected.

**Step 2: Check if a registry-puller image exists on Docker Hub**

Run: `curl -s "https://hub.docker.com/v2/repositories/devintripp/scanrook-registry-puller/tags/?page_size=5" | python3 -m json.tool`

If no image exists, we need to build one.

### Task B2: Build and push updated worker image

**Files:**
- Build context: `~/Desktop/GitHub/scanrook/rust-scanner-worker/`

**Step 1: Check the Dockerfile for multi-binary build**

Read the worker Dockerfile to understand how to build both `dispatcher` and `registry-puller` binaries. The Dockerfile should have build targets for both.

**Step 2: Build the worker image with a new tag**

```bash
cd ~/Desktop/GitHub/scanrook/rust-scanner-worker
docker build --platform linux/amd64 -t devintripp/rust-scanner-worker:k8s-scheduler-v5 .
```

**Step 3: Push the image**

```bash
docker push devintripp/rust-scanner-worker:k8s-scheduler-v5
```

**Step 4: Build and push the registry-puller image (if separate)**

If there's a separate Dockerfile for registry-puller:
```bash
docker build --platform linux/amd64 -f Dockerfile.puller -t devintripp/scanrook-registry-puller:v1 .
docker push devintripp/scanrook-registry-puller:v1
```

If it's built as part of the main image, check if the binary is at `/usr/local/bin/registry-puller` inside the worker image, and use the same image as the puller.

### Task B3: Update K8s deployment manifests

**Files:**
- Modify: `~/Desktop/GitHub/scanrook/scanrook-ui/k8s/scanrook/dispatcher-deployment.yaml`

**Step 1: Update image tags**

Change both `image:` and `DISPATCHER_SCAN_IMAGE` env var from `k8s-scheduler-v4` to `k8s-scheduler-v5`.

**Step 2: Add REGISTRY_PULLER_IMAGE env var**

Add to the dispatcher container's `env` section:
```yaml
            - name: REGISTRY_PULLER_IMAGE
              value: devintripp/rust-scanner-worker:k8s-scheduler-v5
```

(Use the same image if registry-puller binary is baked into the worker image, or use `devintripp/scanrook-registry-puller:v1` if separate.)

**Step 3: Commit and push**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
git add k8s/scanrook/dispatcher-deployment.yaml
git commit -m "fix: bump dispatcher to k8s-scheduler-v5, add REGISTRY_PULLER_IMAGE"
git push origin main
```

ArgoCD will auto-sync.

**Step 4: Verify on cluster**

Wait for ArgoCD to sync and the dispatcher pod to restart. Then:
- Check dispatcher logs for successful startup
- Submit a registry scan for `nginx:latest`
- Verify the K8s Job is created with an init container
- Verify the scan completes successfully

### Task B4: Re-queue failed registry jobs

**Step 1: Re-queue via database**

SSH to cluster and run:
```sql
UPDATE scan_jobs SET status='queued', started_at=NULL, worker_id=NULL,
  progress_pct=0, error_msg=NULL, finished_at=NULL
WHERE id IN ('7fff3967-02b4-4593-8fc6-9fb2fb7e4e12', 'd43aab9f-d761-4514-9aea-e2946c51f550');
```

---

## Workstream C: Architecture Docs + Sidebar Fixes

### Task C1: Fix sidebar navigation

**Files:**
- Modify: `src/app/docs/layout.tsx`

**Step 1: Add missing pages to navItems**

In the `concepts` children array, add after the last entry:
```typescript
            { href: "/docs/concepts/scan-status", label: "Scan Status" },
            { href: "/docs/concepts/vulnerability-database", label: "Vulnerability Database" },
```

**Step 2: Add breadcrumb labels**

Add to `breadcrumbLabels`:
```typescript
    "scan-status": "Scan Status",
    "vulnerability-database": "Vulnerability Database",
    architecture: "Architecture",
```

**Step 3: Add architecture page to navItems**

Add after "Self-Hosted":
```typescript
    { href: "/docs/architecture", label: "Architecture" },
```

**Step 4: Commit**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
git add src/app/docs/layout.tsx
git commit -m "fix: add missing docs pages to sidebar navigation"
```

### Task C2: Create architecture docs page

**Files:**
- Create: `src/app/docs/architecture/page.tsx`

**Step 1: Create the architecture page**

Create `src/app/docs/architecture/page.tsx` with:

1. **System Overview** — Mermaid diagram showing the 3 components (Web, Dispatcher, Scanner) and data stores (PostgreSQL, MinIO/S3, Redis)

2. **Cluster Topology** — Mermaid diagram showing 3 nodes, namespace allocation, pod distribution

3. **Scan Pipeline** — Mermaid sequence diagram: Browser → presigned POST → S3 → POST /api/jobs → PostgreSQL → dispatcher polls → creates K8s Job → scan pod downloads from S3 → runs scanner → uploads report → marks done → SSE to browser

4. **Registry Scan Flow** — Mermaid diagram: API creates job → dispatcher creates K8s Job with init container → registry-puller pulls image → uploads to S3 → scan container runs

5. **Network Flow** — Mermaid diagram: Internet → Caddy (edge-proxy, TLS) → ingress-nginx (NodePort 30080) → service ClusterIPs → pods. Outbound: pods → Squid proxy (10.10.10.2:3128) → internet

6. **Data Stores** — Table with PostgreSQL databases, S3 buckets, Redis usage

The page should use the same styling as other docs pages (prose classes, section headers).

**Step 2: Run type check**

Run: `cd ~/Desktop/GitHub/scanrook/scanrook-ui && npx tsc --noEmit`

**Step 3: Test locally**

Run dev server, navigate to `/docs/architecture`, verify Mermaid diagrams render (if using a Mermaid React component) or are displayed as code blocks (if relying on client-side rendering).

Note: Check if the codebase already has a Mermaid rendering component. If not, use static SVG or pre-rendered diagrams, or add `mermaid` as a dependency.

**Step 4: Commit**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
git add src/app/docs/architecture/page.tsx
git commit -m "docs: add architecture page with Mermaid diagrams"
```

### Task C3: Build, push, and deploy all UI changes

**Step 1: Build new UI Docker image**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
docker build --platform linux/amd64 -t devintripp/deltaguard-ui:v1.14.5 .
```

**Step 2: Push to Docker Hub**

```bash
docker push devintripp/deltaguard-ui:v1.14.5
```

**Step 3: Update deployment manifest**

Change image tag in `k8s/scanrook/deployment.yaml` from `v1.14.4` to `v1.14.5`.

**Step 4: Commit and push**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
git add k8s/scanrook/deployment.yaml
git commit -m "chore: bump UI image to v1.14.5"
git push origin main
```

ArgoCD auto-syncs.

---

## Execution Order

Workstreams A, B, and C are independent and can be parallelized:

- **A (UI expand row)** and **C (docs)** both modify scanrook-ui and should be done before Task C3 (build/deploy)
- **B (worker fix)** modifies the Go worker repo and scanrook-ui k8s manifests independently

Recommended order:
1. A1 (expand row) + C1 (sidebar) + C2 (architecture page) — parallel, all UI
2. C3 (build + deploy UI)
3. B1-B2 (investigate + build worker) — can run in parallel with step 1
4. B3 (update k8s manifests + deploy)
5. B4 (re-queue failed jobs)

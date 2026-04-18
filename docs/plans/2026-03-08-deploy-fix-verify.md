# UI Deploy v1.14.6 + Grafana Fix + Scanner Verification

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy the new architecture docs page, fix Grafana 503, and verify the registry scan pipeline end-to-end.

**Architecture:** Four independent workstreams — (1) Fix Grafana manifest and push for ArgoCD sync, (2) Build and push UI Docker image v1.14.6, (3) Update K8s deployment manifest and push, (4) Test registry scan and verify UI features after deploy.

**Tech Stack:** Docker, Kubernetes, ArgoCD, Next.js, Mermaid

---

## Task 1: Fix Grafana CrashLoopBackOff

**Files:**
- Modify: `k8s/scanrook/monitoring/grafana-deployment.yaml:192-194`

**Step 1: Update Grafana image and pull policy**

In `k8s/scanrook/monitoring/grafana-deployment.yaml`, change lines 192-194:

```yaml
# FROM:
          image: grafana/grafana:11.5.2
          imagePullPolicy: IfNotPresent

# TO:
          image: grafana/grafana:11.6.0
          imagePullPolicy: Always
```

The root cause is `exec format error` — the node cached a wrong-architecture image. Bumping the tag forces a fresh pull, and `Always` prevents future stale cache issues.

**Step 2: Commit and push**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
git add k8s/scanrook/monitoring/grafana-deployment.yaml
git commit -m "fix: bump Grafana to 11.6.0 with Always pull policy (exec format error)"
git push origin main
```

ArgoCD will auto-sync the monitoring app. Verify in ~2 min that the Grafana pod restarts successfully.

**Step 3: Verify Grafana on cluster**

```bash
ssh dg-node1 "kubectl -n monitoring get pods -l app=grafana -w"
```

Expected: Pod transitions from CrashLoopBackOff → ContainerCreating → Running. Wait for READY 1/1.

Then verify Grafana UI loads at https://grafana.scanrook.io (admin / scanrook-grafana-2026).

---

## Task 2: Build and push UI Docker image v1.14.6

**Step 1: Build the Docker image**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
docker build --platform linux/amd64 -t devintripp/deltaguard-ui:v1.14.6 .
```

Expected: Build completes successfully (~3-5 min). The image includes the new architecture docs page with Mermaid diagrams.

**Step 2: Push to Docker Hub**

```bash
docker push devintripp/deltaguard-ui:v1.14.6
```

Expected: All layers push successfully.

---

## Task 3: Update deployment manifest and deploy

**Files:**
- Modify: `k8s/scanrook/deployment.yaml:36`

**Step 1: Update image tag**

In `k8s/scanrook/deployment.yaml`, change line 36:

```yaml
# FROM:
          image: devintripp/deltaguard-ui:v1.14.5

# TO:
          image: devintripp/deltaguard-ui:v1.14.6
```

**Step 2: Commit and push**

```bash
cd ~/Desktop/GitHub/scanrook/scanrook-ui
git add k8s/scanrook/deployment.yaml
git commit -m "chore: bump UI image to v1.14.6"
git push origin main
```

**Step 3: Verify rolling update on cluster**

```bash
ssh dg-node1 "kubectl -n scanrook get pods -l app=scanrook-web -w"
```

Expected: Rolling update — new pods come up with v1.14.6, old pods terminate. All 3 replicas should be READY 1/1 within ~2 min.

```bash
ssh dg-node1 "kubectl -n scanrook get pod -l app=scanrook-web -o jsonpath='{.items[*].spec.containers[*].image}'"
```

Expected: `devintripp/deltaguard-ui:v1.14.6 devintripp/deltaguard-ui:v1.14.6 devintripp/deltaguard-ui:v1.14.6`

---

## Task 4: Test registry scan (nginx:latest)

**Step 1: Submit a registry scan**

Use the ScanRook API to submit a public image scan. You need an auth token — get one by signing in or using an API key.

```bash
# Via curl (replace TOKEN with a valid session cookie or API key)
curl -X POST https://scanrook.io/api/registry/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API_KEY>" \
  -d '{"image": "nginx:latest"}'
```

Expected: Returns JSON with `{id: "<job-uuid>", status: "queued", ...}`

**Step 2: Monitor the K8s Job**

```bash
ssh dg-node1 "kubectl -n scanrook get jobs -w"
ssh dg-node1 "kubectl -n scanrook get pods -l app=scanrook-scan -w"
```

Watch for:
1. Job created by dispatcher
2. Init container (registry-puller) starts and completes
3. Main scan container starts and runs

Check init container logs:
```bash
ssh dg-node1 "kubectl -n scanrook logs <pod-name> -c registry-puller"
```

Expected: Pulls nginx:latest image, uploads tar to S3.

**Step 3: Verify job completes**

```bash
# Check job status via DB
ssh dg-node1 "kubectl -n scanrook exec deploy/scanrook-web -- npx prisma db execute --stdin <<< \"SELECT id, status, progress_pct, error_msg FROM scan_jobs ORDER BY created_at DESC LIMIT 5;\""
```

Or monitor SSE events:
```bash
curl -N https://scanrook.io/api/jobs/<job-id>/events -H "Authorization: Bearer <API_KEY>"
```

Expected: Job reaches status `done` with `progress_pct = 100`.

---

## Task 5: Verify UI features

**Step 1: Verify architecture docs page**

Open https://scanrook.io/docs/architecture in a browser. Verify:
- Page loads without errors
- All 5 Mermaid diagrams render (System Overview, Cluster Topology, Scan Pipeline, Registry Scan Flow, Network Flow)
- Namespace table and data stores tables display correctly
- Sidebar shows "Architecture" link

**Step 2: Verify dashboard expand row**

Open https://scanrook.io/dashboard. Expand a job row. Verify:
- Full tabbed view appears (Dashboard / Findings / Threat tabs)
- For completed jobs: severity bars, "View Findings" link
- For running jobs: SSE connects, progress ring updates live

---

## Execution Order

Tasks 1 and 2 are independent — run in parallel.
Task 3 depends on Task 2 (image must be pushed first).
Task 4 can run any time after dispatcher v6 is confirmed running.
Task 5 depends on Task 3 (UI must be deployed).

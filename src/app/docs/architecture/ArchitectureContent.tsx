"use client";

import MermaidDiagram from "@/components/MermaidDiagram";

export default function ArchitectureContent() {
  return (
    <article className="grid gap-6">
      {/* Header */}
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Architecture</h1>
        <p className="muted text-sm max-w-3xl">
          ScanRook is a multi-service vulnerability scanning platform deployed on
          a bare-metal Kubernetes cluster. Three components — a Next.js web app,
          a Go dispatcher, and a Rust scanner — work together to process scan
          jobs via PostgreSQL and S3.
        </p>
      </section>

      {/* System Overview */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="System overview"
          blurb="Three services connected by PostgreSQL and S3/MinIO."
        />
        <MermaidDiagram
          chart={`
graph TB
  subgraph Browser
    UI[Browser Client]
  end

  subgraph "scanrook namespace"
    WEB["scanrook-web<br/>(Next.js · 3 replicas)"]
    DISP["scanrook-dispatcher<br/>(Go · 1 replica)"]
    REDIS["Redis<br/>(session cache)"]
  end

  subgraph "db namespace"
    PG["pg-shared (CNPG)<br/>PostgreSQL · 3 instances"]
  end

  subgraph "storage namespace"
    S3["MinIO<br/>S3-compatible"]
  end

  subgraph "K8s Jobs"
    SCAN["Scan Pod<br/>(Rust scanner binary)"]
  end

  UI -->|"presigned POST"| S3
  UI -->|"HTTPS"| WEB
  WEB -->|"Prisma / raw SQL"| PG
  WEB -->|"SSE via pg_notify"| PG
  WEB --> REDIS
  DISP -->|"polls scan_jobs"| PG
  DISP -->|"creates K8s Job"| SCAN
  SCAN -->|"downloads artifact"| S3
  SCAN -->|"inserts events + findings"| PG
  SCAN -->|"uploads report"| S3
`}
        />
      </section>

      {/* Cluster Topology */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Cluster topology"
          blurb="Three-node bare-metal cluster with dedicated namespaces."
        />
        <MermaidDiagram
          chart={`
graph LR
  subgraph "Internet"
    CLIENT[Client]
  end

  subgraph "DMZ (192.168.1.x)"
    CADDY["edge-proxy<br/>Caddy · TLS termination"]
    BASTION["dg-bastion<br/>SSH jump host"]
  end

  subgraph "Cluster Network (10.10.10.x)"
    N1["node-1 (control plane)<br/>8 CPU · 15 GiB · 300 GB"]
    N2["node-2 (worker)<br/>8 CPU · 15 GiB · 300 GB"]
    N3["node-3 (worker)<br/>8 CPU · 15 GiB · 300 GB"]
  end

  CLIENT -->|"HTTPS :443"| CADDY
  CADDY -->|"HTTP :30080"| N1
  CADDY -->|"HTTP :30080"| N2
  CADDY -->|"HTTP :30080"| N3
  CLIENT -->|"SSH :60022"| BASTION
  BASTION --> N1
  BASTION --> N2
  BASTION --> N3
`}
        />
        <div className="overflow-x-auto">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-left">
                <th className="py-2 pr-4 font-semibold">Namespace</th>
                <th className="py-2 pr-4 font-semibold">Contents</th>
              </tr>
            </thead>
            <tbody className="muted">
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-mono">scanrook</td>
                <td className="py-2">scanrook-web (3), scanrook-dispatcher (1), redis (1)</td>
              </tr>
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-mono">db</td>
                <td className="py-2">CNPG pg-shared cluster (3 instances, 50 GiB PVC each)</td>
              </tr>
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-mono">storage</td>
                <td className="py-2">MinIO (1 replica, 50 GiB PVC)</td>
              </tr>
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-mono">ingress-nginx</td>
                <td className="py-2">Ingress controller (NodePort 30080/30443)</td>
              </tr>
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-mono">monitoring</td>
                <td className="py-2">Prometheus, Grafana, Loki, Promtail, node-exporter, kube-state-metrics</td>
              </tr>
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-mono">argocd</td>
                <td className="py-2">ArgoCD (GitOps deployment)</td>
              </tr>
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-mono">longhorn-system</td>
                <td className="py-2">Longhorn distributed block storage</td>
              </tr>
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-4 font-mono">cnpg-system</td>
                <td className="py-2">CloudNativePG operator</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono">kube-system</td>
                <td className="py-2">Cilium CNI, CoreDNS, Hubble</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Scan Pipeline */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Scan pipeline"
          blurb="End-to-end data flow from file upload to scan results."
        />
        <MermaidDiagram
          chart={`
sequenceDiagram
  participant B as Browser
  participant W as scanrook-web
  participant S3 as MinIO (S3)
  participant PG as PostgreSQL
  participant D as Dispatcher
  participant K as K8s Job (Scanner)

  B->>W: POST /api/uploads/presign
  W-->>B: presigned POST URL
  B->>S3: PUT artifact (presigned)
  B->>W: POST /api/jobs {bucket, key}
  W->>PG: INSERT scan_jobs (status=queued)
  W->>PG: pg_notify('job_events')

  loop Poll every 5s
    D->>PG: SELECT ... WHERE status='queued' FOR UPDATE
  end
  D->>PG: UPDATE status='running'
  D->>K: kubectl create Job

  K->>S3: Download artifact
  K->>K: Run scanrook binary
  K->>PG: INSERT scan_events (progress)
  K->>S3: Upload report JSON
  K->>PG: UPDATE status='done', summary_json

  PG-->>W: pg_notify('scan_events')
  W-->>B: SSE /api/jobs/{id}/events
`}
        />
      </section>

      {/* Registry Scan Flow */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Registry scan flow"
          blurb="How container images are pulled from registries and scanned."
        />
        <MermaidDiagram
          chart={`
sequenceDiagram
  participant B as Browser
  participant W as scanrook-web
  participant PG as PostgreSQL
  participant D as Dispatcher
  participant I as Init Container<br/>(registry-puller)
  participant S3 as MinIO (S3)
  participant SC as Scan Container

  B->>W: POST /api/scan/from-registry {image: "nginx:latest"}
  W->>PG: INSERT scan_jobs (scan_type=registry, registry_image=nginx:latest)

  D->>PG: Acquire job
  D->>D: Build K8s Job with init container

  Note over I: Init container runs first
  I->>I: Pull image layers (OCI)
  I->>I: Write tar to /scratch
  I->>S3: Upload image tar to registry-pulls/

  Note over SC: Main container starts after init
  SC->>S3: Download image tar
  SC->>SC: Run scanrook scan
  SC->>PG: Insert findings + events
  SC->>S3: Upload report
  SC->>PG: Mark job done
`}
        />
        <p className="text-xs muted">
          For public images, no credentials are needed. Private registries use
          encrypted credentials stored per-organization in PostgreSQL, decrypted
          at dispatch time with AES-256-GCM.
        </p>
      </section>

      {/* Network Flow */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Network flow"
          blurb="How traffic flows from the internet to pods and back out."
        />
        <MermaidDiagram
          chart={`
graph LR
  subgraph "Internet"
    USER[User]
    REG[Container Registries]
    VULN[OSV / NVD / EPSS APIs]
  end

  subgraph "Edge (192.168.1.80)"
    CADDY["Caddy<br/>TLS termination<br/>scanrook.io<br/>scanrook.sh"]
  end

  subgraph "Cluster"
    ING["ingress-nginx<br/>NodePort 30080"]
    SVC["scanrook-web:3000"]
    DSVC["scanrook-dispatcher:8080"]
    PODS["Scan Pods"]
    SQUID["Squid Proxy<br/>10.10.10.2:3128"]
  end

  USER -->|"HTTPS :443"| CADDY
  CADDY -->|"HTTP :30080"| ING
  ING --> SVC
  PODS -->|"HTTP_PROXY"| SQUID
  SQUID --> REG
  SQUID --> VULN
`}
        />
        <div className="text-sm muted grid gap-2">
          <p>
            <strong className="font-semibold" style={{ color: "var(--dg-text)" }}>Inbound:</strong>{" "}
            All external HTTPS traffic terminates at the Caddy edge-proxy, which
            forwards plain HTTP to the ingress-nginx NodePort. Ingress rules
            route to the appropriate ClusterIP service.
          </p>
          <p>
            <strong className="font-semibold" style={{ color: "var(--dg-text)" }}>Outbound:</strong>{" "}
            Scan pods use HTTP_PROXY/HTTPS_PROXY environment variables pointing
            to a Squid proxy for external API calls (OSV, NVD, EPSS, container
            registries). This allows network policy enforcement and caching.
          </p>
        </div>
      </section>

      {/* Data Stores */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Data stores"
          blurb="PostgreSQL tables, S3 buckets, and Redis usage."
        />
        <div className="grid gap-4">
          <h3 className="text-sm font-semibold">PostgreSQL tables</h3>
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-left">
                  <th className="py-2 pr-4 font-semibold">Table</th>
                  <th className="py-2 pr-4 font-semibold">Purpose</th>
                  <th className="py-2 font-semibold">Key columns</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 font-mono">scan_jobs</td>
                  <td className="py-2 pr-4">Job queue and status tracking</td>
                  <td className="py-2">id (UUID), status, bucket, object_key, summary_json, scan_type</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 font-mono">scan_events</td>
                  <td className="py-2 pr-4">Progress timeline per job</td>
                  <td className="py-2">job_id, stage, detail, pct, created_at</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 font-mono">scan_findings</td>
                  <td className="py-2 pr-4">Normalized vulnerability findings</td>
                  <td className="py-2">job_id, cve_id, severity, package, version, cvss</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 font-mono">scan_files</td>
                  <td className="py-2 pr-4">File inventory from scanned artifacts</td>
                  <td className="py-2">job_id, path, entry_type, size, sha256</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono">scan_packages</td>
                  <td className="py-2 pr-4">Package inventory (SBOM)</td>
                  <td className="py-2">job_id, ecosystem, name, version, source</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-semibold mt-2">S3 buckets</h3>
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-left">
                  <th className="py-2 pr-4 font-semibold">Bucket</th>
                  <th className="py-2 pr-4 font-semibold">Purpose</th>
                  <th className="py-2 font-semibold">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 font-mono">deltaguard</td>
                  <td className="py-2 pr-4">Uploaded artifacts (tars, binaries, ISOs)</td>
                  <td className="py-2">7-day expiry</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 font-mono">reports</td>
                  <td className="py-2 pr-4">Scan report JSON files</td>
                  <td className="py-2">90-day expiry</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono">registry-pulls</td>
                  <td className="py-2 pr-4">Pulled container image tars</td>
                  <td className="py-2">Cleaned after scan</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-semibold mt-2">Redis</h3>
          <p className="text-xs muted">
            Single-instance Redis used for NextAuth session caching and token
            revocation. Session data is stored with a 7-day TTL. Token version
            checks enable instant session invalidation across all web replicas.
          </p>
        </div>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}

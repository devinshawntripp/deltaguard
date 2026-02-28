import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Self-Hosted Deployment",
  description:
    "Deploy ScanRook on your own infrastructure with Kubernetes or Docker Compose. Covers architecture, prerequisites, configuration, scaling, and air-gapped operation.",
};

type EnvVar = {
  name: string;
  purpose: string;
  component: string;
  required: boolean;
};

const envVars: EnvVar[] = [
  { name: "DATABASE_URL", purpose: "PostgreSQL connection string", component: "Web, Worker", required: true },
  { name: "S3_ENDPOINT", purpose: "S3-compatible object storage endpoint", component: "Web, Worker", required: true },
  { name: "S3_ACCESS_KEY", purpose: "S3 access key ID", component: "Web, Worker", required: true },
  { name: "S3_SECRET_KEY", purpose: "S3 secret access key", component: "Web, Worker", required: true },
  { name: "S3_USE_SSL", purpose: "Enable TLS for S3 connections", component: "Web, Worker", required: false },
  { name: "S3_REGION", purpose: "S3 region (e.g. us-east-1)", component: "Web, Worker", required: false },
  { name: "UPLOADS_BUCKET", purpose: "Bucket for uploaded artifacts", component: "Web, Worker", required: true },
  { name: "REPORTS_BUCKET", purpose: "Bucket for scan report JSON files", component: "Web, Worker", required: true },
  { name: "SCANNER_PATH", purpose: "Path to the scanrook binary inside the worker container", component: "Worker", required: false },
  { name: "SCRATCH_DIR", purpose: "Temporary directory for downloaded artifacts during scans", component: "Worker", required: false },
  { name: "WORKER_CONCURRENCY", purpose: "Number of parallel scan jobs per worker pod", component: "Worker", required: false },
  { name: "WORKER_STALE_JOB_TIMEOUT_SECONDS", purpose: "Seconds before a running job with no heartbeat is marked failed", component: "Worker", required: false },
  { name: "NEXTAUTH_URL", purpose: "Canonical URL of the web application (e.g. https://scanrook.example.com)", component: "Web", required: true },
  { name: "NEXTAUTH_SECRET", purpose: "Secret used to encrypt session tokens (generate with openssl rand -base64 32)", component: "Web", required: true },
  { name: "NVD_API_KEY", purpose: "NVD API key for higher rate limits during enrichment", component: "Worker", required: false },
  { name: "HTTP_ADDR", purpose: "Listen address for the worker health endpoint", component: "Worker", required: false },
];

export default function SelfHostedPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Self-Hosted Deployment</h1>
        <p className="muted text-sm max-w-3xl">
          ScanRook can be deployed entirely on your own infrastructure. Self-hosting
          gives you full control over your data, allows operation in air-gapped
          environments, and helps meet compliance requirements that prohibit sending
          artifacts or vulnerability data to third-party services. This guide covers
          the architecture, prerequisites, Kubernetes deployment, configuration, scaling,
          and offline operation.
        </p>
      </section>

      {/* Architecture Overview */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Architecture overview"
          blurb="The ScanRook platform consists of five components that communicate via PostgreSQL and S3-compatible object storage."
        />
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <strong>Web application (Next.js)</strong> -- Dashboard, API routes, scan
            job management, user authentication, and SSE progress streaming.
          </li>
          <li>
            <strong>Worker service (Go)</strong> -- Polls PostgreSQL for queued jobs,
            downloads artifacts from S3, executes the scanner binary, tails NDJSON
            progress, and uploads reports.
          </li>
          <li>
            <strong>Scanner binary (Rust)</strong> -- Core scanning engine. Auto-detects
            file types, extracts package inventories, and enriches findings from OSV,
            NVD, and distro feeds. Bundled inside the worker container image.
          </li>
          <li>
            <strong>PostgreSQL</strong> -- Job queue, scan events, user data, and
            optional CVE cache.
          </li>
          <li>
            <strong>S3-compatible storage</strong> -- MinIO, AWS S3, or any
            S3-compatible service. Stores uploaded artifacts and scan report JSON files.
          </li>
        </ul>

        <div className="overflow-x-auto">
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`Browser                           Infrastructure
  |                                   |
  |-- presigned POST --> [ S3 (uploads bucket) ]
  |                                   |
  |-- POST /api/jobs --> [ Web (Next.js) ] --> [ PostgreSQL ]
  |                                   |              |
  |                                   |    polls scan_jobs (status=queued)
  |                                   |              |
  |                                   |      [ Worker (Go) ]
  |                                   |        |          |
  |                                   |  downloads from S3  executes scanner
  |                                   |        |          |
  |                                   |  tails NDJSON     [ Scanner (Rust) ]
  |                                   |        |
  |                                   |  inserts scan_events --> pg_notify
  |                                   |        |
  |                                   |  uploads report --> [ S3 (reports bucket) ]
  |                                   |
  |<-- SSE /api/jobs/[id]/events ---- [ Web ] <-- polls scan_events
  |<-- GET /api/jobs/[id]/report ---- [ Web ] <-- fetches from S3`}</code></pre>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Prerequisites"
          blurb="What you need before deploying ScanRook."
        />
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <strong>Kubernetes cluster (1.25+)</strong> or Docker Compose for
            single-node deployments
          </li>
          <li>
            <strong>PostgreSQL 15+</strong> -- managed service or self-hosted (e.g.
            CloudNativePG, Amazon RDS)
          </li>
          <li>
            <strong>S3-compatible object storage</strong> -- MinIO (recommended for
            self-hosted), AWS S3, Google Cloud Storage with S3 compatibility, or
            DigitalOcean Spaces
          </li>
          <li>
            <strong>4 GB RAM minimum</strong> (8 GB recommended for worker nodes
            running concurrent scans)
          </li>
          <li>
            <strong>Domain name with TLS certificate</strong> -- for the web
            dashboard. Use cert-manager with Let&apos;s Encrypt or provide your own
            certificate.
          </li>
          <li>
            <strong>Container registry access</strong> -- to pull ScanRook container
            images (ghcr.io/devinshawntripp/scanrook-web and
            ghcr.io/devinshawntripp/scanrook-worker)
          </li>
        </ul>
      </section>

      {/* Kubernetes Deployment */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Kubernetes deployment"
          blurb="Step-by-step instructions for deploying ScanRook on Kubernetes."
        />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">1. Create the namespace</h3>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`kubectl create namespace scanrook`}</code></pre>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">2. Create secrets</h3>
            <p className="text-xs muted">
              Store database credentials, S3 keys, and auth secrets. Replace the
              placeholder values with your actual credentials.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`apiVersion: v1
kind: Secret
metadata:
  name: scanrook-secrets
  namespace: scanrook
type: Opaque
stringData:
  DATABASE_URL: "postgres://user:pass@db-host:5432/scanrook?sslmode=require"
  S3_ACCESS_KEY: "your-access-key"
  S3_SECRET_KEY: "your-secret-key"
  NEXTAUTH_SECRET: "generate-with-openssl-rand-base64-32"
  NVD_API_KEY: "your-nvd-api-key"  # optional but recommended`}</code></pre>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">3. Create ConfigMap</h3>
            <p className="text-xs muted">
              Non-sensitive configuration shared by the web and worker deployments.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`apiVersion: v1
kind: ConfigMap
metadata:
  name: scanrook-config
  namespace: scanrook
data:
  S3_ENDPOINT: "minio.scanrook.svc:9000"
  S3_USE_SSL: "false"
  S3_REGION: "us-east-1"
  UPLOADS_BUCKET: "uploads"
  REPORTS_BUCKET: "reports"
  NEXTAUTH_URL: "https://scanrook.example.com"
  SCANNER_PATH: "/usr/local/bin/scanrook"
  SCRATCH_DIR: "/scratch"
  WORKER_CONCURRENCY: "2"
  WORKER_STALE_JOB_TIMEOUT_SECONDS: "1800"
  HTTP_ADDR: ":8080"`}</code></pre>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">4. Web deployment</h3>
            <p className="text-xs muted">
              Three replicas are recommended for high availability. The web application
              serves the dashboard and API routes.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: scanrook-web
  namespace: scanrook
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scanrook-web
  template:
    metadata:
      labels:
        app: scanrook-web
    spec:
      containers:
        - name: web
          image: ghcr.io/devinshawntripp/scanrook-web:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: scanrook-config
            - secretRef:
                name: scanrook-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: scanrook-web
  namespace: scanrook
spec:
  selector:
    app: scanrook-web
  ports:
    - port: 3000
      targetPort: 3000`}</code></pre>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">5. Worker deployment</h3>
            <p className="text-xs muted">
              Workers execute scans. Scale the replica count based on your expected scan
              volume. Each worker runs{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">WORKER_CONCURRENCY</code>{" "}
              parallel jobs.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: scanrook-worker
  namespace: scanrook
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scanrook-worker
  template:
    metadata:
      labels:
        app: scanrook-worker
    spec:
      containers:
        - name: worker
          image: ghcr.io/devinshawntripp/scanrook-worker:latest
          envFrom:
            - configMapRef:
                name: scanrook-config
            - secretRef:
                name: scanrook-secrets
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          volumeMounts:
            - name: scratch
              mountPath: /scratch
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 30
      volumes:
        - name: scratch
          emptyDir:
            sizeLimit: 10Gi`}</code></pre>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">6. Ingress</h3>
            <p className="text-xs muted">
              Expose the web application with TLS. This example uses nginx-ingress
              with cert-manager.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: scanrook-ingress
  namespace: scanrook
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - scanrook.example.com
      secretName: scanrook-tls
  rules:
    - host: scanrook.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: scanrook-web
                port:
                  number: 3000`}</code></pre>
          </div>
        </div>
      </section>

      {/* Environment Variable Reference */}
      <section className="surface-card p-7 grid gap-4 overflow-x-auto">
        <SectionHeader
          title="Environment variable reference"
          blurb="All environment variables used by the web and worker components."
        />
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="text-left py-2 pr-4">Variable</th>
              <th className="text-left py-2 pr-4">Purpose</th>
              <th className="text-left py-2 pr-4">Component</th>
              <th className="text-left py-2">Required</th>
            </tr>
          </thead>
          <tbody>
            {envVars.map((v) => (
              <tr key={v.name} className="border-b border-black/5 dark:border-white/5 align-top">
                <td className="py-2 pr-4">
                  <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">{v.name}</code>
                </td>
                <td className="py-2 pr-4 muted">{v.purpose}</td>
                <td className="py-2 pr-4 muted">{v.component}</td>
                <td className="py-2 muted">{v.required ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Scaling */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Scaling"
          blurb="Tuning ScanRook for high-volume scan workloads."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            ScanRook scales horizontally at the worker layer. Each worker pod polls
            PostgreSQL for queued jobs using{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">SELECT ... FOR UPDATE SKIP LOCKED</code>,
            so multiple workers can safely process jobs in parallel without conflicts.
          </p>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Worker concurrency</h3>
            <p>
              The{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">WORKER_CONCURRENCY</code>{" "}
              environment variable controls how many scans a single worker pod runs in
              parallel. The default is 2. For worker pods with 2 GB+ memory, you can
              safely increase this to 3-4. Total cluster scan throughput is{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">replicas x WORKER_CONCURRENCY</code>.
            </p>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Horizontal pod autoscaling</h3>
            <p>
              For dynamic scaling, use a Kubernetes HPA based on CPU utilization or a
              custom metric derived from the scan_jobs queue depth.
            </p>
          </div>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: scanrook-worker-hpa
  namespace: scanrook
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: scanrook-worker
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`}</code></pre>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Recommendations for high-volume environments</h3>
            <ul className="list-disc pl-6 text-sm muted grid gap-1">
              <li>
                Run 3+ worker replicas with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">WORKER_CONCURRENCY=1</code>{" "}
                each for better fault isolation
              </li>
              <li>
                Use dedicated worker nodes with node selectors or taints to prevent
                scan workloads from competing with the web application
              </li>
              <li>
                Enable PostgreSQL CVE caching via{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">DATABASE_URL</code>{" "}
                on the scanner to avoid redundant API calls across workers
              </li>
              <li>
                Add Redis as a distributed cache layer for even faster lookups across
                multiple worker pods
              </li>
              <li>
                Monitor the{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">scan_jobs</code>{" "}
                table for queue depth (jobs with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">status = &apos;queued&apos;</code>)
                to detect backpressure
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Air-Gapped Operation */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Air-gapped operation"
          blurb="Running ScanRook without internet access to external vulnerability databases."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            ScanRook can operate in fully air-gapped environments by pre-seeding its
            vulnerability cache before deploying to the isolated network. The scanner
            checks its local file cache, then PostgreSQL, then Redis before making any
            external API calls. If the cache contains the needed data, no outbound
            requests are made.
          </p>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Pre-seeding the cache</h3>
            <p>
              On a machine with internet access, use the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">scanrook db</code>{" "}
              commands to warm the cache with vulnerability data for your target artifacts.
            </p>
          </div>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`# On a machine with internet access:

# Warm cache for a specific artifact
scanrook db download --file ./myapp.tar

# Or update all sources broadly
scanrook db update --source all --file ./myapp.tar

# Check cache status
scanrook db check

# Package the cache directory for transfer
tar -czf scanrook-cache.tar.gz ~/.scanrook/cache/`}</code></pre>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Deploying the cache</h3>
            <p>
              Transfer the cache archive to your air-gapped environment and mount it
              into the worker pods. Set the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">SCANNER_CACHE</code>{" "}
              environment variable to point to the mounted path.
            </p>
          </div>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`# Extract the cache on the air-gapped host
tar -xzf scanrook-cache.tar.gz -C /opt/scanrook/

# Mount as a volume in the worker deployment
volumes:
  - name: vuln-cache
    hostPath:
      path: /opt/scanrook/cache
      type: Directory

# Reference in the container spec
volumeMounts:
  - name: vuln-cache
    mountPath: /cache
    readOnly: true

# Set the environment variable
env:
  - name: SCANNER_CACHE
    value: "/cache"`}</code></pre>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Disabling external enrichment</h3>
            <p>
              To prevent the scanner from attempting outbound connections (which would
              fail and slow down scans), explicitly disable enrichment sources that
              require internet access.
            </p>
          </div>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto"><code>{`env:
  - name: SCANNER_NVD_ENRICH
    value: "0"
  - name: SCANNER_OSV_ENRICH
    value: "0"
  - name: SCANNER_SKIP_CACHE
    value: "0"  # ensure cache is used`}</code></pre>

          <p>
            With enrichment disabled and a pre-warmed cache, scans will use only
            cached vulnerability data. Periodically refresh the cache on an
            internet-connected machine and transfer updated archives to the air-gapped
            environment.
          </p>
        </div>
      </section>

      {/* Further reading */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Further reading"
          blurb="Related documentation for getting started and using the CLI."
        />
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <a href="/docs/quickstart" className="underline" style={{ color: "var(--dg-accent-ink)" }}>
              Quickstart
            </a>{" "}
            -- Install ScanRook and run your first scan in under two minutes.
          </li>
          <li>
            <a href="/docs/cli-reference" className="underline" style={{ color: "var(--dg-accent-ink)" }}>
              CLI Reference
            </a>{" "}
            -- Complete reference for all subcommands, flags, and environment variables.
          </li>
          <li>
            <a href="/docs/concepts/enrichment" className="underline" style={{ color: "var(--dg-accent-ink)" }}>
              Enrichment
            </a>{" "}
            -- How ScanRook queries vulnerability databases and merges findings.
          </li>
          <li>
            <a href="/docs/data-sources" className="underline" style={{ color: "var(--dg-accent-ink)" }}>
              Data Sources
            </a>{" "}
            -- Full provider table with ecosystem coverage and integration status.
          </li>
        </ul>
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

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-28";

const title = `AKS Security: Hardening Azure Kubernetes Service | ${APP_NAME}`;
const description =
  "A practical AKS security guide: Entra ID and workload identity, private API servers, node patching, network policy, admission control and image scanning.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "aks security",
    "azure kubernetes service security",
    "aks hardening",
    "aks best practices",
    "aks workload identity",
    "aks private cluster",
    "aks network policy",
    "azure policy for aks",
    "aks node image upgrade",
    "aks container scanning",
  ],
  alternates: { canonical: "/blog/aks-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/aks-security",
    images: ["/blog/aks-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/aks-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "AKS Security: Hardening Azure Kubernetes Service",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/aks-security",
  image: "https://scanrook.io/blog/aks-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does Azure secure in AKS, and what do I secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Azure operates and patches the managed control plane - the API server, scheduler and etcd. You are responsible for everything from the node pools upward: node OS updates, the workloads you deploy, container images and their CVEs, RBAC, network policy, secrets handling and egress control. Most real AKS incidents originate in that customer-owned half.",
      },
    },
    {
      "@type": "Question",
      name: "Should I run a private AKS cluster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A private cluster gives the API server a private endpoint reachable only from your virtual network, which removes it from the public internet entirely. It is the stronger option, at the cost of needing a jump host, VPN or self-hosted CI runners for cluster access. If that operational overhead is not workable, API server authorized IP ranges are a meaningful improvement over a fully open endpoint.",
      },
    },
    {
      "@type": "Question",
      name: "What is AKS workload identity?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Workload identity lets a pod obtain a Microsoft Entra token by federating its Kubernetes service account with a managed identity or app registration through the cluster's OIDC issuer. No client secret is stored in the cluster and tokens are short-lived. It replaces the older pod-managed identity approach and is the recommended way for AKS workloads to reach Azure services.",
      },
    },
    {
      "@type": "Question",
      name: "How do I keep AKS nodes patched?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AKS exposes two separate upgrade channels. The cluster auto-upgrade channel governs Kubernetes minor and patch versions. The node OS auto-upgrade channel governs the node operating system image, with options that either apply security patches in place or roll to a fresh node image. Set both explicitly and pair them with a planned maintenance window and pod disruption budgets.",
      },
    },
    {
      "@type": "Question",
      name: "Does AKS scan container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Microsoft Defender for Containers can scan images in Azure Container Registry and assess running workloads, and it integrates with Defender for Cloud recommendations. Many teams also scan earlier, in the build pipeline, so a vulnerable image is caught before it is ever pushed - and some run a second scanner because different tools consult different advisory databases.",
      },
    },
  ],
};

export default function Page() {
  if (!isPublished({ publishDate: PUBLISH_DATE })) notFound();
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">Best practices</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            AKS Security: Hardening Azure Kubernetes Service
          </h1>
          <p className="text-sm muted">Published November 28, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            AKS security is mostly not about the control plane. Azure runs and patches that for you.
            What is left &mdash; identity, node images, network paths, admission policy and the CVEs
            inside your containers &mdash; is entirely yours, and it is where nearly every real
            incident starts. This is a practical walkthrough of the controls that matter, in roughly
            the order they pay off.
          </p>
        </header>

        <img
          src="/blog/aks-security.jpg"
          alt="AKS security hardening for Azure Kubernetes Service clusters"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where the responsibility line sits</h2>
          <p className="text-sm muted">
            AKS is a managed control plane. Microsoft operates the API server, scheduler, controller
            manager and etcd, patches them, and does not charge for them on the free tier. Everything
            below the line &mdash; node pools, the OS on those nodes, the container runtime
            configuration you influence, and every workload you deploy &mdash; is yours.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 300"
              role="img"
              aria-label="AKS shared responsibility layers: Azure operates the control plane; the customer owns node pools, cluster configuration, workloads and container images"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <rect x={20} y={16} width={660} height={54} rx={8} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="5 4" />
              <text x={40} y={40} fontSize="13" fontWeight="600" fill="currentColor">Managed control plane</text>
              <text x={40} y={58} fontSize="10.5" fill="currentColor" fillOpacity={0.6}>API server &middot; scheduler &middot; etcd &mdash; operated and patched by Azure</text>
              <text x={660} y={40} textAnchor="end" fontSize="10.5" fill="currentColor" fillOpacity={0.55}>Azure</text>

              {[
                { y: 84, label: "Cluster configuration", sub: "Entra ID + Azure RBAC, private endpoint, authorized IP ranges, audit logs" },
                { y: 138, label: "Node pools", sub: "OS image channel, host encryption, ephemeral disks, system vs user pools" },
                { y: 192, label: "Network & policy", sub: "network policy engine, egress control, Azure Policy admission" },
                { y: 246, label: "Workloads & images", sub: "pod security, workload identity, container CVEs", hot: true },
              ].map((r) => (
                <g key={r.label}>
                  <rect
                    x={20}
                    y={r.y}
                    width={660}
                    height={46}
                    rx={8}
                    fill={r.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    fillOpacity={r.hot ? 0.12 : 0.05}
                    stroke="currentColor"
                    strokeOpacity={0.4}
                  />
                  <text x={40} y={r.y + 20} fontSize="13" fontWeight="600" fill="currentColor">{r.label}</text>
                  <text x={40} y={r.y + 37} fontSize="10.5" fill="currentColor" fillOpacity={0.62}>{r.sub}</text>
                  <text x={660} y={r.y + 20} textAnchor="end" fontSize="10.5" fill="currentColor" fillOpacity={0.55}>You</text>
                </g>
              ))}
            </svg>
            <figcaption className="text-xs muted mt-3">
              The AKS responsibility split. Azure owns one layer; the four below it are yours, and the
              bottom one &mdash; what is actually running in your containers &mdash; is where most
              exploitable risk accumulates.
            </figcaption>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Identity: kill the local accounts</h2>
          <p className="text-sm muted">
            A default AKS cluster issues a local admin kubeconfig via{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">az aks get-credentials --admin</code>.
            That credential is a static, non-expiring, non-auditable path to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cluster-admin</code>{" "}
            that bypasses your entire identity stack. On a production cluster it should not exist.
          </p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`az aks create \\
  --resource-group platform-prod \\
  --name aks-prod \\
  --enable-aad \\
  --enable-azure-rbac \\
  --disable-local-accounts \\
  --enable-oidc-issuer \\
  --enable-workload-identity \\
  --enable-private-cluster \\
  --network-plugin azure \\
  --network-dataplane cilium \\
  --enable-managed-identity`}</code></pre>
          <p className="text-sm muted">
            The three identity flags do distinct things.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--enable-aad</code>{" "}
            makes Microsoft Entra ID the authenticator, so every{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl</code>{" "}
            call is tied to a real directory principal and subject to conditional access.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--enable-azure-rbac</code>{" "}
            moves authorization into Azure RBAC role assignments instead of in-cluster RoleBindings,
            which means cluster access shows up in the same access reviews as the rest of your
            subscription. And{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--disable-local-accounts</code>{" "}
            removes the bypass.
          </p>
          <p className="text-sm muted">
            For pods reaching Azure services, use <strong>workload identity</strong>. The cluster
            exposes an OIDC issuer; you create a federated credential on a managed identity that
            trusts a specific Kubernetes service account in a specific namespace. The pod exchanges a
            projected service account token for a short-lived Entra token. No client secret ever
            lands in the cluster:
          </p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`apiVersion: v1
kind: ServiceAccount
metadata:
  name: billing-api
  namespace: payments
  annotations:
    azure.workload.identity/client-id: 00000000-1111-2222-3333-444444444444
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: billing-api
  namespace: payments
spec:
  template:
    metadata:
      labels:
        azure.workload.identity/use: "true"
    spec:
      serviceAccountName: billing-api
      containers:
        - name: api
          image: myregistry.azurecr.io/billing-api@sha256:...`}</code></pre>
          <p className="text-sm muted">
            Note the digest pin on the image. Tags are mutable; a digest is not. That single habit
            eliminates a whole class of &ldquo;the image changed underneath us&rdquo; surprises.
          </p>
        </section>

        <img
          src="/blog/aks-security-2.jpg"
          alt="Layered defense rings around an Azure Kubernetes Service cluster core"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reachability: the API server and egress</h2>
          <p className="text-sm muted">
            By default the AKS API server has a public FQDN. Anyone on the internet can reach the TLS
            endpoint; they still need a valid credential, but you are relying on authentication alone
            and exposing every future API server CVE to the whole internet. Two options narrow that:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Private cluster</strong> &mdash; the API server gets a private endpoint in your
              virtual network and no public DNS record resolves to it. This is the strong option. Plan
              for it: your CI runners, bastion and admin workstations all need network line of sight,
              which usually means self-hosted runners or a VPN.
            </li>
            <li>
              <strong>Authorized IP ranges</strong> &mdash; the endpoint stays public but only accepts
              connections from CIDRs you list. Much weaker than a private endpoint, much easier to
              adopt, and far better than nothing. Remember your NAT gateway address and any hosted CI
              egress ranges.
            </li>
          </ul>
          <p className="text-sm muted">
            Egress deserves equal attention and gets far less. A default cluster can reach anything on
            the internet, which is exactly what a compromised container wants for pulling a second
            stage or exfiltrating data. Setting the outbound type to user-defined routing and pushing
            traffic through Azure Firewall with an allowlist of required FQDNs turns egress into a
            decision rather than a default. Inside the cluster, enable a network policy engine &mdash;
            Azure CNI powered by Cilium, or Calico &mdash; and default-deny each namespace. Our guide
            to{" "}
            <Link href="/blog/kubernetes-network-policies" className="underline">
              Kubernetes network policies
            </Link>{" "}
            covers the patterns; the AKS-specific point is that the engine must be selected at cluster
            creation, so retrofitting means a new cluster.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Nodes: patching is a setting, not a project</h2>
          <p className="text-sm muted">
            AKS separates two upgrade concerns that teams routinely conflate:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Channel</th>
                  <th className="text-left py-2 pr-4 font-semibold">Governs</th>
                  <th className="text-left py-2 font-semibold">Typical production choice</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code className="text-xs">auto-upgrade-channel</code></td>
                  <td className="py-2 pr-4 align-top">Kubernetes minor and patch versions</td>
                  <td className="py-2 align-top">Patch, or stable if you want a lag behind the newest minor</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><code className="text-xs">node-os-upgrade-channel</code></td>
                  <td className="py-2 pr-4 align-top">The node OS image itself</td>
                  <td className="py-2 align-top">NodeImage, so nodes roll to freshly patched images</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Leaving the OS channel unset is the common mistake, and it produces the situation where a
            cluster is on a current Kubernetes version while its nodes run a base image months old and
            full of unpatched userspace CVEs. Pair both channels with a planned maintenance window and
            realistic pod disruption budgets, or automatic upgrades will either be blocked forever or
            land at an inconvenient hour.
          </p>
          <p className="text-sm muted">
            A few more node-level settings worth turning on: host encryption for end-to-end encryption
            of the VM disks and temp disk, ephemeral OS disks so node state is genuinely disposable,
            and a strict separation of system node pools (running CoreDNS, metrics-server and the like)
            from user node pools running your workloads. If you want a baseline to measure against,{" "}
            <Link href="/blog/kube-bench-cis-scanning" className="underline">
              kube-bench
            </Link>{" "}
            covers the parts of the{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Kubernetes benchmark
            </Link>{" "}
            that apply to a managed cluster &mdash; the control plane checks will not apply, since you
            do not own that layer.
          </p>
        </section>

        <img
          src="/blog/aks-security-3.jpg"
          alt="Network mesh with policy enforcement gates between Kubernetes node clusters"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Admission control: enforce, do not advise</h2>
          <p className="text-sm muted">
            Two enforcement points matter here and they complement each other.
          </p>
          <p className="text-sm muted">
            <strong>Pod Security Admission</strong> is built into Kubernetes and needs no add-on. Label
            namespaces to enforce the restricted profile and you have blocked privileged containers,
            host namespace sharing, hostPath mounts and privilege escalation in one line:
          </p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`apiVersion: v1
kind: Namespace
metadata:
  name: payments
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/warn: restricted`}</code></pre>
          <p className="text-sm muted">
            Start with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">warn</code> and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">audit</code> to see what
            would break, then promote to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforce</code>. The{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission guide
            </Link>{" "}
            walks through the migration, and{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              securityContext
            </Link>{" "}
            covers the pod-level fields you will need to set to satisfy it.
          </p>
          <p className="text-sm muted">
            <strong>Azure Policy for AKS</strong> installs a Gatekeeper-based add-on and applies
            Azure-managed policy initiatives to the cluster. It covers what PSA does not &mdash;
            restricting which registries images may come from, requiring resource limits, blocking
            specific capabilities &mdash; and reports compliance into Defender for Cloud alongside the
            rest of your Azure estate. Assign initiatives in audit mode first; a deny-mode assignment
            applied blind to a live cluster will block deployments at the worst possible moment.
          </p>
          <p className="text-sm muted">
            The registry restriction is the one to prioritise. Combined with a rule that images must
            come from your own Azure Container Registry, it means every image entering the cluster has
            passed through a place you control and can scan. That is the hook for{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              image scanning at admission
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The layer AKS settings cannot fix</h2>
          <p className="text-sm muted">
            You can do all of the above correctly and still be running a container with a critical
            OpenSSL vulnerability. Every control described so far constrains what a workload is allowed
            to do; none of them changes what is inside it. That is a separate discipline, and in
            practice it is the one with the most findings.
          </p>
          <p className="text-sm muted">
            Microsoft Defender for Containers covers part of this: it can assess images in ACR and
            surface findings for running workloads in Defender for Cloud, which is genuinely useful and
            well integrated with the rest of Azure. Its coverage is defined by the advisory sources
            behind it, though, and that is true of every scanner &mdash; as our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            shows, different sources describe the same package very differently.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is not an AKS configuration tool. It does not read your cluster, evaluate Azure
            Policy assignments or tell you whether local accounts are disabled &mdash; use Defender for
            Cloud and the Azure Policy compliance view for that.
          </p>
          <p className="text-sm muted">
            What ScanRook does is the bottom layer of that responsibility diagram: given an image
            tarball, a binary or a source archive, it reads the real package databases inside and
            matches every package against OSV, NVD and Red Hat OVAL in parallel, reporting the source
            and a confidence tier for each finding. The natural place to run it is in the pipeline that
            pushes to ACR, before the image is ever admissible to the cluster &mdash; a build gate is
            cheaper than a running-workload finding. Teams often run it alongside their platform&apos;s
            built-in scanner rather than instead of it, because the overlap between advisory sources is
            smaller than people expect. Our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            covers where in the lifecycle each scan belongs.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does Azure secure in AKS?</h3>
              <p className="text-sm muted mt-1">
                The managed control plane &mdash; API server, scheduler, etcd. Node pools, workloads,
                images, RBAC, network policy and secrets are yours.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Private cluster or authorized IP ranges?</h3>
              <p className="text-sm muted mt-1">
                A private cluster removes the API server from the internet entirely and is stronger.
                Authorized IP ranges are easier to adopt and still a large improvement over open access.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is workload identity?</h3>
              <p className="text-sm muted mt-1">
                Federation between a Kubernetes service account and a Microsoft Entra identity via the
                cluster OIDC issuer, giving pods short-lived Azure tokens with no stored secret.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I keep nodes patched?</h3>
              <p className="text-sm muted mt-1">
                Set both the cluster auto-upgrade channel and the node OS auto-upgrade channel, then
                add a maintenance window and pod disruption budgets so upgrades can actually complete.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan before it reaches the cluster</h3>
          <p className="text-sm muted leading-relaxed">
            Hardened AKS settings do not patch the packages inside your images. Scan an image you
            already push to ACR &mdash; every ScanRook finding carries its advisory source and a
            confidence tier, so build gates are defensible.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">Read the docs</Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes Vulnerability Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-network-policies" className="underline">
              Kubernetes Network Policies
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

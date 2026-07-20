import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-25";

const title = `Kubernetes RBAC: A Practical Security Guide | ${APP_NAME}`;
const description =
  "How Kubernetes RBAC really works: Roles vs ClusterRoles, the binding scope matrix, the verbs that grant cluster admin by accident, and how to audit it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kubernetes rbac",
    "kubernetes role vs clusterrole",
    "rolebinding clusterrolebinding",
    "kubectl auth can-i",
    "kubernetes least privilege",
    "service account permissions",
    "rbac privilege escalation",
    "kubernetes rbac best practices",
    "aggregated clusterrole",
    "kubernetes security",
  ],
  alternates: { canonical: "/blog/kubernetes-rbac" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kubernetes-rbac",
    images: ["/blog/kubernetes-rbac.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kubernetes-rbac.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Kubernetes RBAC: A Practical Security Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kubernetes-rbac",
  image: "https://scanrook.io/blog/kubernetes-rbac.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Kubernetes RBAC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kubernetes RBAC is the authorization system that decides whether an authenticated identity may perform a given verb on a given resource. It is built from four objects: Role and ClusterRole define sets of permissions, and RoleBinding and ClusterRoleBinding attach those permission sets to users, groups, or service accounts. RBAC is purely additive - there are no deny rules.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a Role and a ClusterRole?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Role is namespaced and can only reference namespaced resources. A ClusterRole is cluster-scoped and can additionally cover cluster-scoped resources such as nodes and persistent volumes, plus non-resource URLs like the health endpoint. A ClusterRole can be reused across namespaces by referencing it from a RoleBinding in each one.",
      },
    },
    {
      "@type": "Question",
      name: "Which RBAC permissions are the most dangerous?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The ones that lead to cluster admin indirectly. Creating pods in a namespace lets you mount that namespace's secrets and any service account token in it. Get or list on secrets exposes credentials directly. The escalate and bind verbs on roles let a subject grant themselves permissions they do not have, and impersonate lets them act as anyone. Wildcards on verbs or resources usually include all of these.",
      },
    },
    {
      "@type": "Question",
      name: "How do I check what a service account can do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use kubectl auth can-i with impersonation. Running kubectl auth can-i --list as a service account prints every permission that identity resolves to, aggregated across all bindings, which is far more reliable than reading role definitions by hand. Any identity that can impersonate is effectively unrestricted, so keep that verb rare.",
      },
    },
    {
      "@type": "Question",
      name: "Should pods mount a service account token?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if they call the Kubernetes API. Most workloads never do, and mounting a token gives anyone who compromises the container a valid cluster credential for free. Set automountServiceAccountToken to false on service accounts and pods that do not need API access.",
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
            Kubernetes RBAC: A Practical Security Guide
          </h1>
          <p className="text-sm muted">Published October 25, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Kubernetes RBAC is conceptually small &mdash; four object types, a list of verbs, no deny
            rules &mdash; and it still produces some of the most consequential misconfigurations in
            production clusters. The failure is almost never someone deliberately granting cluster
            admin. It is a permission that looks harmless in a manifest and turns out to be cluster
            admin by a shorter route. This is how the model works and how to audit what you have.
          </p>
        </header>

        <img
          src="/blog/kubernetes-rbac.jpg"
          alt="Kubernetes RBAC roles and permission bindings across a cluster"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The four objects</h2>
          <p className="text-sm muted">
            Everything in Kubernetes RBAC is built from four resources in the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              rbac.authorization.k8s.io
            </code>{" "}
            API group. Two describe <em>what may be done</em>, two describe <em>who may do it</em>.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Role</strong> &mdash; a namespaced set of rules. Each rule names API groups,
              resources, and verbs, optionally narrowed to specific resource names.
            </li>
            <li>
              <strong>ClusterRole</strong> &mdash; the same, but cluster-scoped. Only a ClusterRole can
              cover cluster-scoped resources such as nodes, persistent volumes, and namespaces, or
              non-resource URLs like the health endpoints.
            </li>
            <li>
              <strong>RoleBinding</strong> &mdash; grants a Role or ClusterRole to subjects{" "}
              <em>within one namespace</em>.
            </li>
            <li>
              <strong>ClusterRoleBinding</strong> &mdash; grants a ClusterRole to subjects{" "}
              <em>across the entire cluster</em>.
            </li>
          </ul>
          <p className="text-sm muted">
            RBAC is purely additive. There is no deny rule and no ordering; a request is allowed if any
            binding permits it. That is why removing a permission means finding and editing every
            binding that grants it, and why a single overly generous ClusterRoleBinding cannot be
            counteracted by a narrower rule elsewhere.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The scope matrix</h2>
          <p className="text-sm muted">
            The combination that trips people up is ClusterRole plus RoleBinding. It is legal, common,
            and useful: the permission set is defined once cluster-wide, but the grant applies only in
            the namespace where the RoleBinding lives.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Matrix of Role and ClusterRole against RoleBinding and ClusterRoleBinding, showing which combinations grant namespace scope, cluster scope, or are invalid"
              className="w-full"
              style={{ minWidth: 540 }}
            >
              <text
                x={360}
                y={26}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                fillOpacity={0.7}
              >
                permission set (columns) &times; binding type (rows)
              </text>
              <text
                x={300}
                y={62}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="currentColor"
              >
                Role
              </text>
              <text
                x={540}
                y={62}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="currentColor"
              >
                ClusterRole
              </text>
              <text x={16} y={112} fontSize="12" fontWeight="600" fill="currentColor">
                RoleBinding
              </text>
              <text x={16} y={192} fontSize="12" fontWeight="600" fill="currentColor">
                ClusterRoleBinding
              </text>
              {[
                {
                  x: 190,
                  y: 78,
                  ok: true,
                  head: "Namespace scope",
                  sub: "rules limited to that namespace",
                },
                {
                  x: 430,
                  y: 78,
                  ok: true,
                  head: "Namespace scope",
                  sub: "shared rules, local grant",
                },
                { x: 190, y: 158, ok: false, head: "Invalid", sub: "a Role cannot bind cluster-wide" },
                {
                  x: 430,
                  y: 158,
                  ok: true,
                  head: "Cluster scope",
                  sub: "every namespace at once",
                  hot: true,
                },
              ].map((c) => (
                <g key={`${c.x}-${c.y}`}>
                  <rect
                    x={c.x}
                    y={c.y}
                    width={220}
                    height={64}
                    rx={8}
                    fill={
                      c.hot ? "var(--dg-accent,#2563eb)" : c.ok ? "currentColor" : "currentColor"
                    }
                    fillOpacity={c.hot ? 0.16 : c.ok ? 0.05 : 0.02}
                    stroke="currentColor"
                    strokeOpacity={c.ok ? 0.45 : 0.25}
                    strokeDasharray={c.ok ? undefined : "5 4"}
                  />
                  <text
                    x={c.x + 110}
                    y={c.y + 27}
                    textAnchor="middle"
                    fontSize="12.5"
                    fontWeight="600"
                    fill="currentColor"
                    fillOpacity={c.ok ? 1 : 0.5}
                  >
                    {c.head}
                  </text>
                  <text
                    x={c.x + 110}
                    y={c.y + 46}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="currentColor"
                    fillOpacity={0.6}
                  >
                    {c.sub}
                  </text>
                </g>
              ))}
              <text
                x={360}
                y={240}
                textAnchor="middle"
                fontSize="10.5"
                fill="currentColor"
                fillOpacity={0.6}
              >
                The highlighted cell is the one worth reviewing line by line.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-3">
              How permission scope resolves. ClusterRole plus RoleBinding is the pattern to reach for
              when several namespaces need the same rules without a cluster-wide grant.
            </figcaption>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Writing a real Role</h2>
          <p className="text-sm muted">
            A concrete example. This grants a workload read-only access to its own configuration and
            nothing else &mdash; note the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              resourceNames
            </code>{" "}
            narrowing, which is under-used and very effective.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-config-reader
  namespace: payments
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    resourceNames: ["app-config"]
    verbs: ["get", "watch"]
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: payments-api
  namespace: payments
automountServiceAccountToken: false
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: payments-api-config
  namespace: payments
subjects:
  - kind: ServiceAccount
    name: payments-api
    namespace: payments
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: app-config-reader`}
          </pre>
          <p className="text-sm muted">
            Two details matter beyond the rule itself. First,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              resourceNames
            </code>{" "}
            restricts the grant to named objects &mdash; but it cannot restrict{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">list</code>{" "}
            or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              deletecollection
            </code>
            , since those operate over a collection rather than a named object. Granting list on
            secrets &ldquo;but only this one&rdquo; does not work; list returns everything.
          </p>
          <p className="text-sm muted">
            Second,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              automountServiceAccountToken: false
            </code>{" "}
            on the service account. Most workloads never call the Kubernetes API, and a mounted token
            is a live cluster credential sitting in the container filesystem for any attacker who gets
            code execution. Turn it off by default and opt in.
          </p>
        </section>

        <img
          src="/blog/kubernetes-rbac-2.jpg"
          alt="Namespace boundaries isolating workloads in a Kubernetes cluster"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The permissions that are cluster admin in disguise
          </h2>
          <p className="text-sm muted">
            This is the part that matters. Several ordinary-looking grants are equivalent to much more
            than they appear, because Kubernetes resources can be used to obtain credentials.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>create on pods</strong> &mdash; if you can create a pod in a namespace, you can
              create one that mounts any secret in that namespace and any service account&apos;s token,
              then read them. Pod creation is effectively &ldquo;read everything in this
              namespace&rdquo;, and if the namespace hosts a privileged service account, more.
            </li>
            <li>
              <strong>get or list on secrets</strong> &mdash; direct credential disclosure. Treat any
              binding that includes secrets as a credential grant, and see{" "}
              <Link href="/blog/kubernetes-secrets-security" className="underline">
                Kubernetes secrets security
              </Link>{" "}
              for reducing what lives there in the first place.
            </li>
            <li>
              <strong>escalate and bind on roles</strong> &mdash; RBAC normally prevents you from
              granting permissions you do not hold yourself. These two verbs are the documented
              exemptions to that rule, which makes them a direct path to any permission in the cluster.
            </li>
            <li>
              <strong>impersonate</strong> &mdash; act as another user, group, or service account.
              Anyone with broad impersonate rights has whatever the most privileged identity has.
            </li>
            <li>
              <strong>create on pods/exec or read of pods/log</strong> &mdash; subresources are easy to
              forget in a rule review. Exec is code execution inside a running container; logs
              routinely contain tokens and connection strings.
            </li>
            <li>
              <strong>Wildcards</strong> &mdash;{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                verbs: [&quot;*&quot;]
              </code>{" "}
              or{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                resources: [&quot;*&quot;]
              </code>{" "}
              includes everything above, including resources from CRDs installed after the rule was
              written. A wildcard rule silently grows.
            </li>
          </ul>
          <p className="text-sm muted">
            RBAC does not stand alone here. Restricting <em>what</em> a pod may be, not just who may
            create one, is the job of{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>{" "}
            and a hardened{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              security context
            </Link>
            . Pod-create permission is much less dangerous in a namespace that enforces the restricted
            profile.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Auditing what you actually have</h2>
          <p className="text-sm muted">
            Reading role definitions by hand does not scale and misses aggregation. Ask the API server
            instead &mdash; it resolves every binding for you:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Everything a service account can do, fully resolved
kubectl auth can-i --list \\
  --as=system:serviceaccount:payments:payments-api

# A specific question
kubectl auth can-i create pods \\
  --as=system:serviceaccount:payments:payments-api -n payments

# Who holds cluster-wide grants at all
kubectl get clusterrolebindings -o wide

# Find the ones bound to cluster-admin
kubectl get clusterrolebindings -o json | \\
  jq -r '.items[] | select(.roleRef.name=="cluster-admin") | .metadata.name'

# Which roles mention secrets
kubectl get roles,clusterroles -A -o json | \\
  jq -r '.items[] | select(.rules[]?.resources[]? == "secrets") | .metadata.name' | sort -u`}
          </pre>
          <p className="text-sm muted">
            Run the first command for every service account in the cluster, not just the ones you
            suspect. The results are frequently surprising, because permissions accumulate through
            Helm charts and operators that ship their own ClusterRoles. Aggregated ClusterRoles &mdash;
            those with an{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              aggregationRule
            </code>{" "}
            that pulls in any labelled ClusterRole &mdash; deserve special attention: installing a new
            operator can quietly widen the built-in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">edit</code>{" "}
            and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">view</code>{" "}
            roles without anyone editing them.
          </p>
          <p className="text-sm muted">
            Configuration-level checks belong in the same job as your other cluster benchmarks; the
            CIS Kubernetes Benchmark includes RBAC controls, and{" "}
            <Link href="/blog/kube-bench-cis-scanning" className="underline">
              kube-bench
            </Link>{" "}
            will run them for you.
          </p>
        </section>

        <img
          src="/blog/kubernetes-rbac-3.jpg"
          alt="Privilege escalation path through over-permissive Kubernetes RBAC rules"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Practical rules that hold up</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>One service account per workload.</strong> Never let workloads share the default
              service account in a namespace &mdash; a shared identity means every permission any of
              them needs is held by all of them.
            </li>
            <li>
              <strong>Prefer namespaced Roles.</strong> Reach for a ClusterRole only when the resource
              is genuinely cluster-scoped or the same rules are needed in many namespaces &mdash; and
              in the latter case bind it with a RoleBinding, not a ClusterRoleBinding.
            </li>
            <li>
              <strong>Enumerate verbs explicitly.</strong> No wildcards in anything you wrote. If a
              vendor chart ships wildcards, that is worth a conversation before install.
            </li>
            <li>
              <strong>Keep ClusterRoleBindings countable.</strong> You should be able to list every one
              in the cluster and justify it from memory. If you cannot, that is the finding.
            </li>
            <li>
              <strong>Disable token automount by default.</strong> Opt in only for workloads that call
              the API.
            </li>
            <li>
              <strong>Review RBAC in the same PR as the code.</strong> Permissions granted in a hurry
              during an incident are the ones nobody removes.
            </li>
            <li>
              <strong>Layer it.</strong> RBAC controls API access, not network reachability or what a
              container may do at runtime.{" "}
              <Link href="/blog/kubernetes-network-policies" className="underline">
                Network policies
              </Link>{" "}
              and pod-level hardening cover the other dimensions.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            To be straightforward about it: ScanRook does not audit your RBAC. We scan artifacts &mdash;
            container images, source archives, binaries &mdash; for known vulnerabilities, matching every
            package against OSV, NVD, and Red Hat OVAL in parallel with a source and confidence tier on
            each finding.
          </p>
          <p className="text-sm muted">
            The connection is that these two controls fail together. RBAC decides what an identity can
            do <em>after</em> something goes wrong inside a container; vulnerability scanning reduces
            how often that happens in the first place. A remote code execution in an unpatched
            dependency is only a container-level incident until the compromised pod turns out to hold a
            mounted token with list access on secrets across the cluster &mdash; at which point it is a
            cluster incident. Tight RBAC caps the blast radius of a vulnerability you missed; scanning
            reduces how many you miss. If you want the scanning half wired into a cluster, our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            covers the options.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Can RBAC deny something?</h3>
              <p className="text-sm muted mt-1">
                No. RBAC is purely additive with no deny rules, so removing access means finding and
                editing every binding that grants it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Role or ClusterRole?</h3>
              <p className="text-sm muted mt-1">
                Role unless the resource is cluster-scoped. If the same rules are needed in several
                namespaces, define a ClusterRole and bind it with a RoleBinding in each.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is pod creation so dangerous?</h3>
              <p className="text-sm muted mt-1">
                A pod can mount any secret and any service account token in its namespace, so create
                access on pods is effectively read access to that namespace&apos;s credentials.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I audit it?</h3>
              <p className="text-sm muted mt-1">
                kubectl auth can-i --list with impersonation, run for every service account. It
                resolves all bindings, including aggregated ClusterRoles that manifests do not show.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Reduce what RBAC has to contain</h3>
          <p className="text-sm muted leading-relaxed">
            Least privilege limits the damage from a compromised container. Scanning limits how often
            one gets compromised. Run ScanRook against the images your cluster pulls and see every
            finding with its advisory source and confidence tier.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes Secrets Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes Vulnerability Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

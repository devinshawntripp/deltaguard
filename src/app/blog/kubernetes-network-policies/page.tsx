import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-11";

const title = `Kubernetes Network Policies: A Practical Guide | ${APP_NAME}`;
const description =
  "How Kubernetes network policies work: default-allow behavior, a default-deny pattern with working YAML, egress control, and where image scanning fits alongside.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kubernetes network policies",
    "kubernetes networkpolicy",
    "default deny network policy",
    "kubernetes network policy example",
    "network policy egress",
    "kubernetes network segmentation",
    "networkpolicy ingress",
    "kubernetes namespace isolation",
    "calico network policy",
    "cilium network policy",
  ],
  alternates: { canonical: "/blog/kubernetes-network-policies" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kubernetes-network-policies",
    images: ["/blog/kubernetes-network-policies.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kubernetes-network-policies.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Kubernetes Network Policies: A Practical Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kubernetes-network-policies",
  image: "https://scanrook.io/blog/kubernetes-network-policies.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Kubernetes network policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Kubernetes NetworkPolicy is a namespaced resource that controls which network connections are allowed to and from pods, selected by label. It defines ingress and egress allow-rules. By default Kubernetes lets every pod talk to every other pod, so a NetworkPolicy is how you introduce segmentation and least-privilege networking inside a cluster.",
      },
    },
    {
      "@type": "Question",
      name: "Do network policies work on every Kubernetes cluster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. NetworkPolicy objects are only enforced if your cluster runs a CNI plugin that implements them, such as Calico, Cilium, Antrea, or kube-router. On a cluster whose network plugin does not support policies, the API will accept the object but nothing will enforce it, which silently leaves traffic wide open. Always confirm your CNI enforces policies.",
      },
    },
    {
      "@type": "Question",
      name: "How do I create a default-deny network policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Apply a NetworkPolicy with an empty podSelector (which selects every pod in the namespace) and a policyTypes list containing Ingress, but with no ingress rules. That combination denies all incoming traffic to every pod in the namespace. You then layer specific allow policies on top, because policies are additive.",
      },
    },
    {
      "@type": "Question",
      name: "Do network policies control egress as well as ingress?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Including Egress in policyTypes lets you restrict where pods can connect out to. A common gotcha is that a default-deny-egress policy also blocks DNS, so pods cannot resolve service names until you add an egress rule allowing UDP and TCP port 53 to the cluster DNS pods.",
      },
    },
    {
      "@type": "Question",
      name: "Do network policies replace image scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Network policies limit how far an attacker can move once they are inside a pod; they do nothing about the vulnerable packages that let the attacker in. The two are layers of the same defense. You segment the network with policies and scan the image for known CVEs so both the entry point and the blast radius are addressed.",
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
            Kubernetes Network Policies: A Practical Guide
          </h1>
          <p className="text-sm muted">Published November 11, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            By default, a Kubernetes cluster is a flat network: every pod can open a connection to
            every other pod, in any namespace, on any port. That is convenient on day one and
            dangerous by day one hundred. Kubernetes network policies are how you replace that
            open-by-default posture with least-privilege segmentation &mdash; and this guide walks
            through the working YAML to do it.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem: flat by default</h2>
          <p className="text-sm muted">
            When a pod is compromised &mdash; through a vulnerable dependency, a leaked credential, or
            a misconfiguration &mdash; the attacker&apos;s next move is lateral. On a flat network, a
            foothold in a low-value frontend pod gives an attacker a clear path to your database, your
            internal APIs, and every other workload in the cluster. Nothing stops the traffic because
            nothing was ever told to.
          </p>
          <p className="text-sm muted">
            A <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NetworkPolicy</code>{" "}
            is a namespaced Kubernetes resource that changes this. It selects pods by label and
            declares which ingress (inbound) and egress (outbound) connections are permitted. The
            moment any policy selects a pod for a given direction, that pod becomes
            &ldquo;isolated&rdquo; for that direction &mdash; everything not explicitly allowed is
            denied. Policies are additive allow-lists; there is no deny rule, only the absence of an
            allow.
          </p>

          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 200" className="w-full" role="img" aria-label="Left: a default cluster where all pods can reach each other. Right: a default-deny namespace where only an explicitly allowed path from the API pod to the database pod is permitted.">
              <text x="180" y="20" fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle">Default: everything reachable</text>
              <text x="540" y="20" fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle">With default-deny + allow</text>
              <line x1="360" y1="34" x2="360" y2="190" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

              <g fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5">
                <rect x="60" y="50" width="90" height="38" rx="8" />
                <rect x="220" y="50" width="90" height="38" rx="8" />
                <rect x="60" y="140" width="90" height="38" rx="8" />
                <rect x="220" y="140" width="90" height="38" rx="8" />
              </g>
              <g fill="currentColor" fontSize="11" textAnchor="middle">
                <text x="105" y="73">web</text>
                <text x="265" y="73">api</text>
                <text x="105" y="163">cache</text>
                <text x="265" y="163">db</text>
              </g>
              <g stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" strokeWidth="1.5">
                <line x1="150" y1="69" x2="220" y2="69" />
                <line x1="105" y1="88" x2="105" y2="140" />
                <line x1="265" y1="88" x2="265" y2="140" />
                <line x1="150" y1="159" x2="220" y2="159" />
                <line x1="150" y1="60" x2="220" y2="150" />
                <line x1="150" y1="150" x2="220" y2="60" />
              </g>

              <g fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5">
                <rect x="420" y="50" width="90" height="38" rx="8" />
                <rect x="580" y="50" width="90" height="38" rx="8" />
                <rect x="420" y="140" width="90" height="38" rx="8" />
                <rect x="580" y="140" width="90" height="38" rx="8" />
              </g>
              <g fill="currentColor" fontSize="11" textAnchor="middle">
                <text x="465" y="73">web</text>
                <text x="625" y="73">api</text>
                <text x="465" y="163">cache</text>
                <text x="625" y="163">db</text>
              </g>
              <line x1="625" y1="88" x2="625" y2="140" stroke="var(--dg-accent,#2563eb)" strokeWidth="2.5" />
              <polygon points="625,140 621,131 629,131" fill="var(--dg-accent,#2563eb)" />
              <text x="640" y="118" fill="currentColor" fillOpacity="0.7" fontSize="10">allowed</text>
              <g stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="3 3">
                <line x1="510" y1="69" x2="580" y2="69" />
                <line x1="465" y1="88" x2="465" y2="140" />
                <line x1="510" y1="159" x2="580" y2="159" />
              </g>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Before you start: check your CNI</h2>
          <p className="text-sm muted">
            NetworkPolicy is an API contract, not an enforcement engine. The pod network plugin (CNI)
            is what actually enforces it. Calico, Cilium, Antrea, and kube-router do; some older
            configurations of flannel do not enforce policies on their own. If your CNI does not
            support them, the API server will happily accept a NetworkPolicy and <em>nothing will
            happen</em> &mdash; the most dangerous failure mode, because it looks like you are
            protected. Confirm enforcement before you rely on it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: deny all ingress in a namespace</h2>
          <p className="text-sm muted">
            The foundation of any segmented namespace is a default-deny policy. An empty{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">podSelector</code>{" "}
            matches every pod in the namespace; listing{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Ingress</code>{" "}
            in <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">policyTypes</code>{" "}
            with no rules denies all inbound traffic.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: payments
spec:
  podSelector: {}          # every pod in the namespace
  policyTypes:
    - Ingress              # no ingress rules => deny all inbound`}</pre>
          <p className="text-sm muted">
            Apply it with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl apply -f default-deny-ingress.yaml</code>.
            Every pod in the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">payments</code>{" "}
            namespace is now unreachable until you add explicit allow policies.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: allow only the traffic you need</h2>
          <p className="text-sm muted">
            Now open the one path that must exist. This policy lets pods labelled{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">app: payments-api</code>{" "}
            reach the Postgres pod on 5432, and nothing else can:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-to-db
  namespace: payments
spec:
  podSelector:
    matchLabels:
      app: postgres        # policy targets the database pods
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: payments-api   # only the API may connect
      ports:
        - protocol: TCP
          port: 5432`}</pre>
          <p className="text-sm muted">
            Because the default-deny policy from step 1 is still in force, this additive allow is the
            only ingress the database accepts. Add one such policy per legitimate connection and the
            namespace becomes a set of explicit, reviewable data paths.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: control egress (and remember DNS)</h2>
          <p className="text-sm muted">
            Ingress rules stop attackers reaching your pods; egress rules stop a compromised pod
            reaching out &mdash; to an internal service it should not touch, or to an attacker&apos;s
            command-and-control host. Add a default-deny egress, then allow exactly what the workload
            needs. The classic mistake: a default-deny egress also blocks DNS, so name resolution
            breaks. You must explicitly allow port 53 to the cluster DNS pods.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-egress-allow-dns
  namespace: payments
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:                          # allow DNS so service names resolve
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53`}</pre>
          <p className="text-sm muted">
            With DNS allowed, add further egress rules for the specific services each workload calls.
            The result is a pod that can resolve and reach only its declared dependencies.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: isolate namespaces from each other</h2>
          <p className="text-sm muted">
            To keep one team&apos;s workloads out of another&apos;s, combine a default-deny with a
            policy that only admits traffic from the same namespace. Label your namespaces (for
            example <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubernetes.io/metadata.name</code>,
            which Kubernetes sets automatically) and select on it:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-same-namespace
  namespace: payments
spec:
  podSelector: {}
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: payments`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying it worked</h2>
          <p className="text-sm muted">
            Do not trust a policy you have not tested. Spin up a throwaway pod and confirm the traffic
            you expect to be blocked is actually blocked:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# From a pod that should NOT have access, this must hang/fail:
kubectl -n payments run probe --image=busybox --rm -it --restart=Never -- \\
  wget -qO- --timeout=3 http://postgres:5432

# From the payments-api pod, the same connection should succeed.
# List active policies and describe what a pod is subject to:
kubectl -n payments get networkpolicy
kubectl -n payments describe networkpolicy allow-api-to-db`}</pre>
          <p className="text-sm muted">
            Test both directions: the allowed path must work and the denied path must fail. A policy
            that blocks everything, including legitimate traffic, will get ripped out by the first
            on-call engineer it pages.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Network policies are a runtime control: they shrink the blast radius after a pod is
            compromised. They do nothing about <em>why</em> a pod gets compromised in the first place
            &mdash; the vulnerable OpenSSL, the outdated base image, the transitive dependency with a
            known RCE. Segmentation and vulnerability scanning are complementary layers, not
            substitutes, and a serious cluster wants both.
          </p>
          <p className="text-sm muted">
            ScanRook covers the image side of that pairing. It unpacks the container images you deploy,
            reads the real package databases inside them, and matches every component against OSV, NVD,
            and vendor advisory data &mdash; so you reduce the number of pods that can be popped at all,
            while your network policies limit what a popped pod can reach. Pair it with{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control
            </Link>{" "}
            to keep unscanned images out of the cluster entirely, and see the broader{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            for how image and cluster checks fit together. Segmentation also complements workload
            hardening through{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>{" "}
            and careful{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              secrets handling
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Why is my network policy not being enforced?</h3>
              <p className="text-sm muted mt-1">
                Almost always because the CNI does not enforce policies. The API accepts the object
                regardless. Confirm you run Calico, Cilium, Antrea, kube-router, or another
                policy-capable plugin, and that it is configured to enforce.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Are network policies namespaced or cluster-wide?</h3>
              <p className="text-sm muted mt-1">
                The core NetworkPolicy resource is namespaced &mdash; it only affects pods in its own
                namespace. For cluster-wide rules you use CNI-specific extensions such as Calico&apos;s
                GlobalNetworkPolicy or Cilium&apos;s CiliumClusterwideNetworkPolicy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why did DNS break after adding an egress policy?</h3>
              <p className="text-sm muted mt-1">
                A default-deny egress blocks port 53 along with everything else, so pods cannot resolve
                names. Add an egress rule allowing UDP and TCP 53 to the kube-dns / CoreDNS pods and
                resolution returns.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do network policies encrypt traffic?</h3>
              <p className="text-sm muted mt-1">
                No. They allow or deny connections; they do not encrypt them. For in-cluster encryption
                you need mutual TLS, typically from a service mesh, which is a separate control that
                pairs well with segmentation.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Segment the network, then shrink the entry points</h3>
          <p className="text-sm muted leading-relaxed">
            Network policies limit lateral movement; ScanRook reduces how many pods can be compromised
            in the first place. Scan the images you deploy against OSV, NVD, and vendor advisory data,
            with every finding tagged by source and confidence tier.
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
              Kubernetes Vulnerability Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes Secrets Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

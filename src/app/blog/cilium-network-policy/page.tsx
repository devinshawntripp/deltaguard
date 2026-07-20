import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-16";

const title = `Cilium Network Policy: A Practical Guide | ${APP_NAME}`;
const description =
  "How Cilium network policy works with eBPF and identities, how CiliumNetworkPolicy extends Kubernetes NetworkPolicy to L7 and DNS, and how to roll it out safely.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cilium network policy",
    "ciliumnetworkpolicy",
    "cilium ebpf network policy",
    "cilium l7 policy",
    "cilium clusterwide network policy",
    "kubernetes network policy cilium",
    "cilium toFQDNs",
    "hubble policy verdicts",
    "cilium default deny",
    "cilium policy enforcement mode",
  ],
  alternates: { canonical: "/blog/cilium-network-policy" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cilium-network-policy",
    images: ["/blog/cilium-network-policy.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/cilium-network-policy.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Cilium Network Policy: A Practical Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cilium-network-policy",
  image: "https://scanrook.io/blog/cilium-network-policy.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Cilium network policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Cilium network policy is a rule set enforced by the Cilium CNI that controls which workloads in a Kubernetes cluster may talk to each other. Cilium enforces standard Kubernetes NetworkPolicy objects and also provides its own CRDs, CiliumNetworkPolicy and CiliumClusterwideNetworkPolicy, which add DNS-aware egress, cluster-wide scope, entity selectors, and application-layer rules for protocols such as HTTP.",
      },
    },
    {
      "@type": "Question",
      name: "How is CiliumNetworkPolicy different from Kubernetes NetworkPolicy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kubernetes NetworkPolicy is namespaced and works at layers 3 and 4 only: pod selectors, namespace selectors, CIDR blocks, ports, and protocols. CiliumNetworkPolicy supports all of that plus layer 7 rules, DNS name based egress with toFQDNs, special entities such as world, host, and kube-apiserver, and a cluster-wide variant that is not tied to a single namespace.",
      },
    },
    {
      "@type": "Question",
      name: "Does Cilium default to allowing all traffic?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "By default Cilium runs in the default policy enforcement mode, where an endpoint is unrestricted until at least one policy selects it. Once any policy selects an endpoint in a given direction, that direction becomes default deny for that endpoint. You can change this with the policy enforcement mode setting, where always makes every endpoint default deny and never disables enforcement entirely.",
      },
    },
    {
      "@type": "Question",
      name: "How do I debug a dropped connection in Cilium?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use Hubble. Running hubble observe with a dropped verdict filter shows the flows Cilium denied, including source and destination identities and the port involved. Because Cilium evaluates policy against numeric security identities derived from labels, the flow output tells you which identity was rejected, which usually points straight at the missing selector in your policy.",
      },
    },
    {
      "@type": "Question",
      name: "Does network policy replace vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Network policy limits how far an attacker can move after compromising a workload, but it does not remove the vulnerable package that let them in. The two controls are complementary: scan images before they ship to reduce the number of exploitable entry points, and use network policy to contain the blast radius when something slips through.",
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
            Cilium Network Policy: A Practical Guide
          </h1>
          <p className="text-sm muted">Published November 16, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A Cilium network policy is how you decide which workloads in a Kubernetes cluster are
            allowed to talk to each other &mdash; and, unlike the built-in NetworkPolicy object, it
            can reason about DNS names, HTTP paths, and cluster-wide scope. This guide covers how
            Cilium enforces policy with eBPF and identities, the rule shapes you will actually write,
            and how to roll enforcement out without breaking production.
          </p>
        </header>

        <img
          src="/blog/cilium-network-policy.jpg"
          alt="Cilium network policy segmenting Kubernetes workloads"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why Cilium enforces policy differently
          </h2>
          <p className="text-sm muted">
            Most CNI plugins translate NetworkPolicy into iptables rules keyed on pod IP addresses.
            That works, but it scales badly: every pod churn rewrites rules, and the rule set grows
            with the product of pods and policies. Cilium takes a different route. It attaches eBPF
            programs to the kernel datapath and evaluates policy against a <em>security identity</em>
            &mdash; a numeric ID derived from the set of labels on a workload.
          </p>
          <p className="text-sm muted">
            The consequence matters in practice. Every pod carrying the same relevant labels shares
            one identity, so a deployment scaled from three replicas to three hundred does not add a
            single policy entry. Policy decisions become an identity-to-identity lookup rather than an
            IP-to-IP one, which is also why Cilium&apos;s observability output talks about identities
            instead of ephemeral addresses. If you have only ever worked with the vanilla object, our{" "}
            <Link href="/blog/kubernetes-network-policies" className="underline">
              guide to Kubernetes network policies
            </Link>{" "}
            covers the baseline semantics that Cilium builds on top of.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Kubernetes NetworkPolicy vs CiliumNetworkPolicy
          </h2>
          <p className="text-sm muted">
            Cilium enforces plain <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NetworkPolicy</code>{" "}
            objects faithfully, so nothing you already wrote is wasted. Its own CRDs are strictly
            additive:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Capability</th>
                  <th className="text-left py-2 pr-4 font-semibold">NetworkPolicy</th>
                  <th className="text-left py-2 font-semibold">CiliumNetworkPolicy</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Pod / namespace selectors</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Ports and protocols (L3/L4)</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Egress to DNS names</td>
                  <td className="py-2 pr-4 align-top">No &mdash; CIDR only</td>
                  <td className="py-2 align-top">
                    Yes &mdash; <code className="text-xs">toFQDNs</code>
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">L7 rules (HTTP method/path, DNS, Kafka)</td>
                  <td className="py-2 pr-4 align-top">No</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Entity selectors (world, host, kube-apiserver)</td>
                  <td className="py-2 pr-4 align-top">No</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Cluster-wide, non-namespaced scope</td>
                  <td className="py-2 pr-4 align-top">No</td>
                  <td className="py-2 align-top">
                    Yes &mdash; <code className="text-xs">CiliumClusterwideNetworkPolicy</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            A reasonable house rule: use plain NetworkPolicy where it suffices, because it is portable
            across CNIs, and reach for the Cilium CRD when you specifically need DNS egress, L7
            filtering, or cluster-wide baselines.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Writing your first policy</h2>
          <p className="text-sm muted">
            Cilium policies are additive allow-lists. The moment any policy selects an endpoint in a
            direction, that direction flips to default deny for that endpoint. Here is a minimal
            ingress rule letting a frontend reach an API on port 8080:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: api-allow-frontend
  namespace: shop
spec:
  endpointSelector:
    matchLabels:
      app: api
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: frontend
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP`}
          </pre>
          <p className="text-sm muted">
            Note what this rule does <em>not</em> say. It says nothing about egress, so the API pod&apos;s
            outbound traffic is still unrestricted &mdash; enforcement is per direction. It also says
            nothing about other ingress sources, so once this policy exists, everything except the
            frontend on 8080 is denied inbound.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            DNS-aware egress with toFQDNs
          </h2>
          <p className="text-sm muted">
            Egress control is where the built-in object runs out of road. Real services call
            third-party APIs whose IP ranges change constantly, so a CIDR allow-list is either
            hopelessly broad or permanently broken. Cilium solves this by proxying DNS: it watches the
            responses your pods receive and programs the datapath with the addresses that the allowed
            names actually resolved to.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: api-egress-allowlist
  namespace: shop
spec:
  endpointSelector:
    matchLabels:
      app: api
  egress:
    # DNS must be permitted, and the DNS rule is what populates toFQDNs
    - toEndpoints:
        - matchLabels:
            k8s:io.kubernetes.pod.namespace: kube-system
            k8s:k8s-app: kube-dns
      toPorts:
        - ports:
            - port: "53"
              protocol: UDP
          rules:
            dns:
              - matchPattern: "*"
    - toFQDNs:
        - matchName: "api.stripe.com"
        - matchPattern: "*.amazonaws.com"
      toPorts:
        - ports:
            - port: "443"
              protocol: TCP`}
          </pre>
          <p className="text-sm muted">
            The DNS block is not optional decoration. Cilium learns the name-to-IP mapping by
            inspecting DNS answers, so if pods resolve names through a path Cilium cannot see, the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">toFQDNs</code>{" "}
            rule will have nothing to match. This is the single most common cause of &ldquo;my FQDN
            policy does nothing&rdquo; reports.
          </p>
        </section>

        <img
          src="/blog/cilium-network-policy-2.jpg"
          alt="eBPF datapath filtering packets before they reach a Kubernetes workload"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Layer 7 rules and entities</h2>
          <p className="text-sm muted">
            When a policy includes L7 rules, Cilium transparently redirects the matched traffic
            through an in-node proxy that parses the protocol before allowing it through. That lets
            you express something a port number cannot: this client may read, but not write.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`  ingress:
    - fromEndpoints:
        - matchLabels:
            app: reporting
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
          rules:
            http:
              - method: "GET"
                path: "/v1/orders.*"`}
          </pre>
          <p className="text-sm muted">
            L7 enforcement is not free &mdash; proxied traffic costs more than a pure eBPF datapath
            decision &mdash; so apply it to the handful of sensitive interfaces that justify it rather
            than everywhere. Separately, Cilium&apos;s <em>entity</em> selectors cover the traffic that
            has no pod on the other end. <code className="text-xs">toEntities: [world]</code> means
            anything outside the cluster; <code className="text-xs">host</code>,{" "}
            <code className="text-xs">remote-node</code>, and{" "}
            <code className="text-xs">kube-apiserver</code> cover node-local and control-plane traffic
            that would otherwise be awkward to express as a CIDR.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How a packet gets a policy verdict
          </h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Diagram of Cilium policy evaluation: a packet enters the eBPF datapath, the source identity is resolved from labels, an identity-pair policy lookup runs, optional layer 7 proxy inspection follows, and the verdict is allow or drop with the flow logged to Hubble"
              className="w-full"
              style={{ minWidth: 580 }}
            >
              <defs>
                <marker id="ci-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 8, label: "Packet", sub: "pod to pod" },
                { x: 178, label: "Identity", sub: "labels to ID" },
                { x: 348, label: "Policy map", sub: "identity pair", hot: true },
                { x: 528, label: "Verdict", sub: "allow / drop" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={24}
                    width={148}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 74} y={47} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 74} y={65} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[156, 326, 496].map((x) => (
                <line key={x} x1={x} y1={51} x2={x + 20} y2={51} stroke="currentColor" strokeWidth={2} markerEnd="url(#ci-arrow)" />
              ))}
              <rect x={310} y={112} width={230} height={34} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={425} y={133} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                L7 proxy (only if L7 rules match)
              </text>
              <line x1={425} y1={112} x2={425} y2={80} stroke="currentColor" strokeWidth={2} markerEnd="url(#ci-arrow)" />
              <rect x={120} y={184} width={330} height={34} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={285} y={205} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                Every verdict is emitted as a Hubble flow
              </text>
              <line x1={602} y1={80} x2={602} y2={201} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" />
              <line x1={602} y1={201} x2={456} y2={201} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" markerEnd="url(#ci-arrow)" />
            </svg>
            <figcaption className="text-xs muted mt-2">
              Policy is evaluated on identities, not IP addresses &mdash; which is why replica count
              has no effect on the size of the policy state.
            </figcaption>
          </div>
        </section>

        <img
          src="/blog/cilium-network-policy-3.jpg"
          alt="Identity-based segmentation grouping workloads by label rather than IP address"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rolling it out without an outage</h2>
          <p className="text-sm muted">
            Turning on default deny in a live cluster is how people learn which undocumented
            dependencies exist. A safer sequence:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Observe first.</strong> Deploy Cilium with Hubble enabled and watch real traffic
              for a few days. <code className="text-xs">hubble observe --namespace shop</code> gives you
              the actual dependency graph rather than the one on the architecture diagram.
            </li>
            <li>
              <strong>Start per namespace, not cluster-wide.</strong> Write policies for one namespace,
              confirm nothing breaks, and only then consider a{" "}
              <code className="text-xs">CiliumClusterwideNetworkPolicy</code> baseline.
            </li>
            <li>
              <strong>Always allow DNS.</strong> A default-deny egress policy that forgets port 53
              breaks everything in a way that looks like a DNS outage rather than a policy problem.
            </li>
            <li>
              <strong>Watch the drops.</strong>{" "}
              <code className="text-xs">hubble observe --verdict DROPPED --last 200</code> is the first
              command to run when a service starts timing out after a policy change.
            </li>
            <li>
              <strong>Keep policies in Git.</strong> These are security controls; they deserve review,
              the same way image scanning gates do in{" "}
              <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
                admission control
              </Link>
              .
            </li>
          </ul>
          <p className="text-sm muted">
            One footgun worth naming: the policy enforcement mode setting. The default mode leaves an
            endpoint unrestricted until a policy selects it, which is friendly but means a typo in a
            selector silently results in <em>no</em> enforcement rather than a visible failure. Setting
            enforcement to always makes every endpoint default deny, which is stricter and much
            noisier &mdash; a good end state, a bad starting point.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Where network policy sits in a defence stack
          </h2>
          <p className="text-sm muted">
            Network policy is a containment control. It assumes something will eventually be
            compromised and limits how far that compromise travels &mdash; a lateral-movement brake,
            not a prevention mechanism. It does not care whether the workload it is protecting is
            running a five-year-old OpenSSL with a known remote code execution bug; it only decides
            who may reach it.
          </p>
          <p className="text-sm muted">
            That is why it pairs with, rather than replaces, the controls covered in{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>{" "}
            and{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning
            </Link>
            . Segmentation reduces blast radius; scanning reduces the number of ways in. Teams that do
            only one of the two tend to discover the gap during an incident.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not enforce network policy &mdash; Cilium is very good at that, and we have
            no interest in duplicating it. What we do is the other half: telling you what is actually
            inside the images you are about to segment. ScanRook reads the real package databases in a
            container image, binary, or source archive and matches every package against OSV, NVD, and
            Red Hat OVAL in parallel, with each finding carrying its source and a confidence tier.
          </p>
          <p className="text-sm muted">
            In practice the two feed each other. The workloads with the most exploitable surface are
            the ones whose egress rules deserve the tightest scrutiny, and a scan result is a
            reasonable way to decide which namespace to lock down first. If you want the fuller
            picture of what to harden alongside policy, our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>{" "}
            walks through the rest.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is a Cilium network policy?</h3>
              <p className="text-sm muted mt-1">
                A rule set enforced by the Cilium CNI that controls workload-to-workload traffic.
                Cilium honours standard NetworkPolicy objects and adds its own CRDs with DNS-aware
                egress, L7 rules, entity selectors, and cluster-wide scope.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                How does it differ from Kubernetes NetworkPolicy?
              </h3>
              <p className="text-sm muted mt-1">
                NetworkPolicy is namespaced and limited to L3/L4. CiliumNetworkPolicy adds L7
                filtering, <code className="text-xs">toFQDNs</code> egress, entities such as world and
                kube-apiserver, and a non-namespaced cluster-wide variant.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is traffic denied by default?</h3>
              <p className="text-sm muted mt-1">
                Only once a policy selects the endpoint in that direction. In the default enforcement
                mode, unselected endpoints stay unrestricted; setting enforcement to always makes
                everything default deny from the start.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I debug a dropped connection?</h3>
              <p className="text-sm muted mt-1">
                Filter Hubble for dropped verdicts. The flow shows the source and destination
                identities and port, which usually identifies the selector your policy is missing.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know what you are segmenting</h3>
          <p className="text-sm muted leading-relaxed">
            Network policy limits the blast radius; scanning shrinks the number of ways in. Scan the
            images behind your most exposed namespaces and see what is actually installed &mdash;
            every finding carries its source and confidence tier.
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
            <Link href="/blog/kubernetes-network-policies" className="underline">
              Kubernetes Network Policies
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards Guide
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

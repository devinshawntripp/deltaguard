import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-16";

const title = `Defense in Depth Explained: Layered Security That Works | ${APP_NAME}`;
const description =
  "Defense in depth layers independent security controls so no single failure is fatal. The layers, how they apply to containers, and where scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "defense in depth",
    "defense in depth security",
    "defense in depth layers",
    "layered security",
    "defense in depth example",
    "defense in depth explained",
    "defense in depth strategy",
    "defense in depth containers",
    "defense in depth vs zero trust",
    "security layers",
  ],
  alternates: { canonical: "/blog/defense-in-depth" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/defense-in-depth",
    images: ["/blog/defense-in-depth.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/defense-in-depth.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Defense in Depth Explained: Layered Security That Works",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/defense-in-depth",
  image: "https://scanrook.io/blog/defense-in-depth.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is defense in depth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Defense in depth is a security strategy that layers multiple independent controls so that no single failure exposes the whole system. It assumes any one control can and will fail, so it places overlapping defenses across the network, host, application, data, and identity layers, forcing an attacker to defeat several controls rather than one.",
      },
    },
    {
      "@type": "Question",
      name: "What are the layers of defense in depth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A common model has layers for governance and people, network and perimeter, host and workload, application, and data and identity at the core. The exact layers vary by organization, but the principle is constant: independent controls at each layer so an attacker who breaches one still faces the next. Physical security is often included as an outer layer.",
      },
    },
    {
      "@type": "Question",
      name: "Why is defense in depth important?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because every individual control fails eventually. A patch is missed, a firewall rule is wrong, a password leaks. Layering independent controls means a single failure is contained rather than catastrophic, and it buys defenders time to detect and respond before an attacker reaches the crown jewels.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between defense in depth and zero trust?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Defense in depth is about layering independent controls so failures are contained. Zero trust is about never implicitly trusting a request based on network location and verifying every access. They are compatible: zero trust is one modern way to implement the identity and access layers of a defense-in-depth strategy, not a replacement for the whole approach.",
      },
    },
    {
      "@type": "Question",
      name: "Where does vulnerability scanning fit in defense in depth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scanning is a preventive control at the build and artifact layer. It reduces the attack surface by finding known-vulnerable components before they ship, so fewer exploitable weaknesses reach production. It is one layer among many, not a substitute for network, host, and runtime controls, but it removes the raw material many exploits depend on.",
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
          <div className="text-xs uppercase tracking-wide muted">Security Concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Defense in Depth Explained: Layered Security That Works
          </h1>
          <p className="text-sm muted">Published October 16, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Defense in depth is the security idea that survives contact with reality: assume any
            single control will eventually fail, and layer independent controls so that a single
            failure is contained rather than catastrophic. It is not a product you buy or a checkbox
            you tick &mdash; it is an architecture principle. Here is where it came from, what the
            layers actually are, how it applies to modern containers and cloud, and where scanning
            fits in the stack.
          </p>
        </header>

        <img
          src="/blog/defense-in-depth.jpg"
          alt="The layers of a defense-in-depth security strategy"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The core idea</h2>
          <p className="text-sm muted">
            The term comes from military strategy, where the goal was never to hold a single
            impenetrable wall but to slow and wear down an attacker through successive defensive
            positions. Information security borrowed it, notably through the NSA&apos;s information
            assurance guidance, and the translation is direct: no control is perfect, so do not bet
            everything on one.
          </p>
          <p className="text-sm muted">
            The operative assumption is failure. A firewall rule will be misconfigured, a dependency
            will ship a vulnerability, an employee will click a link, a credential will leak. Defense
            in depth accepts all of that as inevitable and asks a different question &mdash; not
            &ldquo;how do we make this control unbreakable?&rdquo; but &ldquo;when this control fails,
            what catches the attacker next?&rdquo; The value is measured in the controls behind the
            one that broke.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The layers</h2>
          <p className="text-sm muted">
            There is no single canonical list, but a workable model wraps the data you are protecting
            in concentric layers of independent controls. An attacker has to defeat each one in turn
            to reach the center:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 400 250" role="img" aria-label="Concentric layers of a defense-in-depth model surrounding data and identity at the core" className="w-full max-w-md mx-auto text-[color:var(--dg-accent,#2563eb)]">
              <rect x="8" y="8" width="384" height="234" rx="8" className="fill-current" stroke="currentColor" opacity="0.12" />
              <text x="18" y="26" fontSize="12" className="fill-current" opacity="0.9">Governance, policy &amp; people</text>
              <rect x="40" y="38" width="320" height="176" rx="8" className="fill-current" stroke="currentColor" opacity="0.2" />
              <text x="50" y="56" fontSize="12" className="fill-current" opacity="0.95">Network &amp; perimeter</text>
              <rect x="78" y="68" width="244" height="118" rx="8" className="fill-current" stroke="currentColor" opacity="0.32" />
              <text x="88" y="86" fontSize="12" className="fill-current" opacity="0.98">Host &amp; workload</text>
              <rect x="116" y="98" width="168" height="60" rx="8" className="fill-current" stroke="currentColor" opacity="0.5" />
              <text x="126" y="116" fontSize="12" fill="#fff">Application</text>
              <rect x="150" y="122" width="100" height="24" rx="6" className="fill-current" opacity="0.85" />
              <text x="163" y="138" fontSize="11" fill="#fff">Data &amp; identity</text>
            </svg>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>Governance, policy &amp; people.</strong> Security awareness training, least-privilege policy, incident response readiness. The outermost layer, because most attacks start with a human.</li>
            <li><strong>Network &amp; perimeter.</strong> Firewalls, segmentation, network policies, and monitoring that limit reachability and detect lateral movement.</li>
            <li><strong>Host &amp; workload.</strong> Hardened operating systems, minimal base images, dropped capabilities, endpoint detection, and patch management on the machines and containers themselves.</li>
            <li><strong>Application.</strong> Secure coding, input validation, dependency and image scanning, and secrets kept out of code.</li>
            <li><strong>Data &amp; identity.</strong> Encryption at rest and in transit, strong authentication and MFA, and access controls guarding the assets everything else exists to protect.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Defense in depth for containers</h2>
          <p className="text-sm muted">
            Containers make the principle concrete because the layers are so tangible. A single
            workload can and should carry independent controls at every level:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>Image.</strong> Start from a minimal base, scan for vulnerable packages, and pin digests so the image cannot silently change.</li>
            <li><strong>Build.</strong> Use multi-stage builds to keep build tooling and secrets out of the runtime image, and generate an SBOM.</li>
            <li><strong>Runtime.</strong> Run as a non-root user, drop Linux capabilities, use a read-only root filesystem, and apply a seccomp profile.</li>
            <li><strong>Orchestration.</strong> Enforce Pod Security Standards, apply network policies to restrict pod-to-pod traffic, and gate deployments with admission control.</li>
            <li><strong>Secrets.</strong> Keep credentials out of images and environment variables; use a managed secret store with encryption at rest.</li>
          </ul>
          <p className="text-sm muted">
            No single item on that list is sufficient. A non-root container with a critically
            vulnerable library is still exploitable; a fully patched image running with excess
            privileges still gives an attacker room after a compromise. The point is the overlap. Our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>{" "}
            and{" "}
            <Link href="/blog/docker-security-guide" className="underline">
              Docker hardening guide
            </Link>{" "}
            walk through implementing these layers, and{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes secrets security
            </Link>{" "}
            covers the data-and-identity layer for clusters.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Common mistakes</h2>
          <p className="text-sm muted">
            The most frequent error is <strong>defense in breadth mistaken for defense in depth</strong>{" "}
            &mdash; buying three tools that all do the same thing at the same layer. Two network
            firewalls in series are not depth; they fail to the same class of bypass. Real depth means
            <em> independent</em> controls at <em>different</em> layers, so the weakness that defeats
            one does not defeat the next.
          </p>
          <p className="text-sm muted">
            A second mistake is treating any single control as the whole strategy &mdash; the
            &ldquo;we scan our images, so we are secure&rdquo; trap. Scanning is a valuable layer, but
            it says nothing about runtime privileges, network exposure, or leaked credentials. A third
            is neglecting the human and detection layers: prevention-only stacks with no monitoring
            leave you blind when a control inevitably fails. Depth without detection just means the
            attacker takes longer, unobserved.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Defense in depth and zero trust</h2>
          <p className="text-sm muted">
            Zero trust is sometimes framed as a replacement for defense in depth. It is not. Zero
            trust is a principle for the identity and access layers &mdash; never trust a request
            purely because it came from inside the network, and verify every access explicitly. That
            is a strong way to build the inner layers, and it directly addresses the classic
            defense-in-depth failure mode where a breached perimeter grants free lateral movement. But
            it does not remove the need for network segmentation, host hardening, or vulnerability
            management. The modern stance is defense in depth <em>with</em> zero-trust identity as one
            of its layers, not one instead of the other.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits in the stack</h2>
          <p className="text-sm muted">
            ScanRook is one layer of a defense-in-depth strategy: the build-and-artifact layer. It
            reads the actual installed packages inside container images, binaries, and source archives
            and matches every component against OSV, NVD, and vendor advisory data, so known-vulnerable
            software is found and removed before it ever reaches production. That shrinks the attack
            surface the other layers have to defend &mdash; the fewer exploitable flaws in the shipped
            artifact, the less work the network, host, and runtime controls have to do. It is
            deliberately not the whole strategy. Pair it with the runtime, network, identity, and
            detection layers, and it does its job well: making sure the software you deploy is not
            carrying known holes into the environment everything else is trying to protect. For the
            operational loop of acting on what it finds, see our{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              vulnerability management guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is defense in depth outdated?</h3>
              <p className="text-sm muted mt-1">
                No. The layers have shifted toward identity and workload as perimeters dissolved, but
                the core principle &mdash; independent, overlapping controls so no single failure is
                fatal &mdash; is as relevant in cloud-native environments as it ever was on-premises.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How many layers should I have?</h3>
              <p className="text-sm muted mt-1">
                There is no magic number. The test is not count but independence: each layer should
                fail differently, so a weakness that defeats one does not automatically defeat the
                others. Redundant controls at the same layer add cost without adding depth.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does defense in depth slow attackers or stop them?</h3>
              <p className="text-sm muted mt-1">
                Both, in combination. Each layer stops some attacks outright and slows the rest,
                buying time for detection and response to catch what prevention missed. The delay is
                itself a defense when paired with monitoring.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is image scanning enough on its own?</h3>
              <p className="text-sm muted mt-1">
                No, and treating it that way is a classic mistake. Scanning removes known-vulnerable
                components, but it does nothing about runtime privileges, network exposure, or leaked
                secrets. It is one valuable layer, not the strategy.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Shrink the attack surface your other layers defend</h3>
          <p className="text-sm muted leading-relaxed">
            The build-and-artifact layer is where you keep known-vulnerable software out of production.
            ScanRook reads the installed packages in your images and binaries and matches them against
            OSV, NVD, and vendor advisories, so fewer exploitable flaws ever reach the layers behind
            it.
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
            <Link href="/blog/container-security-checklist" className="underline">
              Container Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/docker-security-guide" className="underline">
              Docker Security Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

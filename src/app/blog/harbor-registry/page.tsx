import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-03";

const title = `Harbor Registry Explained: Scanning, Signing, and RBAC | ${APP_NAME}`;
const description =
  "Harbor is a CNCF open-source container registry with scanning, signing, and RBAC. How its security features work, and where a deeper image scanner fits in.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "harbor registry",
    "harbor container registry",
    "harbor registry vulnerability scanning",
    "harbor rbac",
    "harbor image signing",
    "cncf harbor",
    "harbor vs docker registry",
    "private container registry",
    "harbor replication",
    "harbor trivy scanner",
  ],
  alternates: { canonical: "/blog/harbor-registry" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/harbor-registry",
    images: ["/blog/harbor-registry.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/harbor-registry.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Harbor Registry Explained: Scanning, Signing, and RBAC",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/harbor-registry",
  image: "https://scanrook.io/blog/harbor-registry.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Harbor registry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Harbor is an open-source registry for container images and other OCI artifacts. Originally built at VMware and now a graduated CNCF project, it adds security and governance on top of plain image storage: role-based access control, built-in vulnerability scanning, image signing, replication between registries, quotas, and retention policies. Teams run it as a private registry they control.",
      },
    },
    {
      "@type": "Question",
      name: "Does Harbor scan images for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Harbor scans images through a pluggable scanner interface, with Trivy bundled as the default. Scans can run automatically on push or on a schedule, and Harbor can block pulls of images whose findings exceed a severity threshold you set. The scanner is swappable, so you can point Harbor at a different adapter that implements its scanner API.",
      },
    },
    {
      "@type": "Question",
      name: "How does Harbor handle access control?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Harbor organizes images into projects and assigns users roles within each project, such as guest, developer, maintainer, and project admin. It integrates with LDAP, Active Directory, and OIDC for authentication, and it uses robot accounts with scoped, revocable tokens for automation like CI pipelines. This keeps registry access auditable and least-privilege.",
      },
    },
    {
      "@type": "Question",
      name: "Can Harbor sign images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Harbor supports image signing so consumers can verify an image came from a trusted source and was not tampered with. Modern deployments use Cosign and the Sigstore ecosystem, and Harbor can enforce that only signed artifacts are pulled. Signing proves provenance and integrity; it does not, by itself, tell you whether the image contains vulnerabilities.",
      },
    },
    {
      "@type": "Question",
      name: "Is Harbor's built-in scanning enough?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For many teams the bundled Trivy scan is a solid baseline. Where finding depth matters, such as compliance audits, it is common to add a second, deeper scan in CI before the image is pushed, using a scanner that queries multiple advisory sources. Harbor's gate then enforces the result rather than being the only line of analysis.",
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
            Harbor Registry Explained: Scanning, Signing, and RBAC
          </h1>
          <p className="text-sm muted">Published December 3, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            A plain container registry stores images and hands them back on request. Harbor is what
            you reach for when that is not enough &mdash; when you need to know who can push where,
            whether an image has been scanned, whether it was signed, and whether a vulnerable build
            should be allowed to run at all. This is a practical tour of the Harbor registry and its
            security features, and an honest note on where a deeper image scanner fits alongside it.
          </p>
        </header>

        <img
          src="/blog/harbor-registry.jpg"
          alt="Harbor registry security features: scanning, signing, and access control"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Harbor is</h2>
          <p className="text-sm muted">
            Harbor is an open-source registry for container images and other OCI artifacts. It began
            at VMware, was donated to the Cloud Native Computing Foundation, and reached graduated
            status &mdash; the CNCF&apos;s highest maturity tier &mdash; in 2020. At its core it is
            an OCI-compliant registry, but the reason teams choose it over a bare registry is the
            governance layer wrapped around storage: access control, scanning, signing, replication,
            quotas, and retention, all managed through a web UI and API.
          </p>
          <p className="text-sm muted">
            Architecturally, Harbor is a set of Go services backed by PostgreSQL and Redis. It runs
            on a VM via Docker Compose or, more commonly in production, on Kubernetes via its Helm
            chart. Because it speaks the OCI distribution spec, any client that pushes and pulls
            standard images &mdash; Docker, containerd, Buildah, Helm using OCI &mdash; works with it
            unchanged.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The security features that matter</h2>
          <p className="text-sm muted">
            Harbor bundles several controls that would otherwise be separate tools. The four worth
            understanding are access control, scanning, signing, and replication.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 740 130" width="100%" role="img" aria-label="The Harbor image lifecycle: push, scan, sign, gate pull, replicate" className="min-w-[660px]">
              <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12">
                {[
                  { x: 6, label: "Push", sub: "CI robot account" },
                  { x: 152, label: "Scan", sub: "Trivy on push" },
                  { x: 298, label: "Sign", sub: "Cosign / Sigstore" },
                  { x: 444, label: "Gate pull", sub: "block by severity" },
                  { x: 590, label: "Replicate", sub: "to edge / DR" },
                ].map((s) => (
                  <g key={s.label}>
                    <rect x={s.x} y={34} width={134} height={54} rx={8}
                      fill="var(--dg-accent,#2563eb)" fillOpacity="0.08"
                      stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                    <text x={s.x + 67} y={58} textAnchor="middle" fontWeight="600" fill="currentColor">{s.label}</text>
                    <text x={s.x + 67} y={76} textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="10">{s.sub}</text>
                  </g>
                ))}
                {[140, 286, 432, 578].map((x) => (
                  <line key={x} x1={x} y1={61} x2={x + 12} y2={61}
                    stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" markerEnd="url(#ha)" />
                ))}
                <defs>
                  <marker id="ha" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" fillOpacity="0.4" />
                  </marker>
                </defs>
                <text x={370} y={112} textAnchor="middle" fill="currentColor" fillOpacity="0.55" fontSize="11">
                  An image&apos;s path through Harbor, from CI push to gated pull and replication.
                </text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            <strong>Access control.</strong> Harbor groups images into projects and grants users
            roles per project &mdash; guest, developer, maintainer, project admin. It authenticates
            against LDAP, Active Directory, or OIDC, and it issues robot accounts with scoped,
            revocable tokens so a CI pipeline can push to exactly one project and nothing more.
          </p>
          <p className="text-sm muted">
            <strong>Vulnerability scanning.</strong> Harbor scans images through a pluggable scanner
            interface, with Trivy bundled as the default. Scans can trigger automatically on push or
            run on a schedule, and results appear per tag in the UI. Crucially, Harbor can enforce a
            policy: block the pull of any image whose findings exceed a severity you choose. Trivy is
            the same engine covered in{" "}
            <Link href="/blog/trivy-operator-kubernetes" className="underline">
              Trivy Operator
            </Link>{" "}
            and our{" "}
            <Link href="/compare/trivy" className="underline">ScanRook vs Trivy</Link> comparison.
          </p>
          <p className="text-sm muted">
            <strong>Signing.</strong> Harbor supports image signing so a consumer can verify
            provenance and integrity. Modern setups use Cosign and the Sigstore ecosystem &mdash;
            the mechanics are in{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Image Signing with Sigstore and Cosign
            </Link>
            . Signing proves who built an image and that it was not altered; it says nothing about
            whether the image is free of CVEs, which is a separate question the scanner answers.
          </p>
          <p className="text-sm muted">
            <strong>Replication and governance.</strong> Harbor replicates artifacts to and from
            other registries &mdash; other Harbor instances, Docker Hub, cloud registries &mdash; on
            push or on a schedule, which is how teams distribute images to edge clusters or maintain
            disaster-recovery copies. Project quotas, tag retention and immutability rules, garbage
            collection, and a pull-through proxy cache round out the governance surface.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Harbor in a deployment pipeline</h2>
          <p className="text-sm muted">
            A typical flow uses Harbor as the control point between build and deploy. CI builds an
            image and pushes it with a robot account. Harbor scans it, you sign it, and a
            severity-based policy decides whether it is pullable. Downstream, a Kubernetes admission
            controller refuses to run images that were not signed or that Harbor flagged &mdash; the
            pattern in{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes admission control for image scanning
            </Link>
            . The registry stops being a passive store and becomes a policy gate.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The limits of registry-side scanning</h2>
          <p className="text-sm muted">
            Registry-side scanning is convenient because it happens automatically and centrally, but
            it has two honest limits. First, it runs <em>after</em> the image is pushed &mdash; a bad
            build has already left the developer&apos;s machine and travelled through CI before the
            registry weighs in. Scanning earlier, in the build pipeline, catches problems before they
            are published; our{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              guide to scanning Docker images
            </Link>{" "}
            covers that placement. Second, the depth of the findings is only as good as the scanner
            behind the adapter. A single-database scanner is fast but sees fewer advisories than one
            that queries several sources.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not replace Harbor &mdash; you still want a registry with RBAC, signing,
            and replication, and Harbor is an excellent one. What ScanRook adds is depth of analysis
            on the image itself. Run it in CI before the push, so the image Harbor stores has already
            passed a multi-source scan against OSV, NVD, and Red Hat OVAL, with a source and
            confidence tier on every finding. Or pull an image from Harbor and scan the tar directly
            when you need an audit-grade second opinion on what a stored artifact really contains.
            Harbor governs the registry; ScanRook tells you, in detail, what is inside the thing
            being governed. The two are complementary, and the honest framing is that neither is a
            substitute for the other.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Harbor registry?</h3>
              <p className="text-sm muted mt-1">
                A graduated CNCF open-source registry for container images and OCI artifacts, adding
                RBAC, scanning, signing, replication, and quotas on top of plain storage.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Harbor scan images?</h3>
              <p className="text-sm muted mt-1">
                Yes, through a pluggable scanner interface with Trivy as the default. It can scan on
                push and block pulls of images above a severity threshold.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does signing mean an image is safe?</h3>
              <p className="text-sm muted mt-1">
                No. Signing proves provenance and integrity &mdash; who built it and that it was not
                altered. Whether it contains CVEs is a separate question only scanning answers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Harbor&apos;s built-in scan enough?</h3>
              <p className="text-sm muted mt-1">
                It is a solid baseline. Under audit pressure, teams add a deeper multi-source scan in
                CI and let Harbor&apos;s gate enforce the result.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan before you push</h3>
          <p className="text-sm muted leading-relaxed">
            Harbor governs your registry. ScanRook gives you the deep view of what is inside each
            image &mdash; matched against OSV, NVD, and OVAL, with a source and confidence tier on
            every finding &mdash; so the artifacts you store have already passed an audit-grade scan.
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
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Image Signing with Sigstore and Cosign
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

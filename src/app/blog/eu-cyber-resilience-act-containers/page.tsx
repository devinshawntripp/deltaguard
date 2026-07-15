import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-17";

const title = `Cyber Resilience Act and Container Images | ${APP_NAME}`;
const description =
  "What the EU Cyber Resilience Act means for container images: SBOM duties, vulnerability handling, and patching obligations for products with digital elements.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cyber resilience act",
    "eu cyber resilience act",
    "cyber resilience act containers",
    "cyber resilience act compliance",
    "cra container images",
    "eu cra sbom",
    "cra vulnerability handling",
    "products with digital elements",
    "cra 2027",
    "cra software supply chain",
  ],
  alternates: { canonical: "/blog/eu-cyber-resilience-act-containers" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/eu-cyber-resilience-act-containers",
    images: ["/blog/eu-cyber-resilience-act-containers.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/eu-cyber-resilience-act-containers.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Cyber Resilience Act and Container Images",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/eu-cyber-resilience-act-containers",
  image: "https://scanrook.io/blog/eu-cyber-resilience-act-containers.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the EU Cyber Resilience Act?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Cyber Resilience Act (CRA) is an EU regulation that sets cybersecurity requirements for products with digital elements sold in the European Union, covering hardware and software alike. It requires manufacturers to build in security by design, document components including via an SBOM, and handle vulnerabilities throughout the product's supported lifetime.",
      },
    },
    {
      "@type": "Question",
      name: "Does the CRA apply to container images specifically?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The CRA applies to products with digital elements, not to container images as a packaging format in isolation. If a container image is part of how a regulated product is delivered or operated, the components inside it — including the base image and every installed package — fall within the CRA's documentation and vulnerability-handling scope.",
      },
    },
    {
      "@type": "Question",
      name: "When does the CRA take effect?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The CRA entered into force in December 2024, with obligations phasing in over several years and full enforcement reached in 2027. Vulnerability and incident reporting duties begin earlier than the full compliance deadline, so manufacturers should not treat 2027 as the date to start preparing.",
      },
    },
    {
      "@type": "Question",
      name: "What does the CRA require for vulnerability handling?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Manufacturers must have a documented process for identifying and remediating vulnerabilities in their products for a defined support period, and must report actively exploited vulnerabilities and severe incidents to ENISA within tight timeframes. This requires knowing what components a product contains at any point in time, which is what an SBOM provides.",
      },
    },
    {
      "@type": "Question",
      name: "Should I consult a lawyer about CRA compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Whether the CRA applies to a specific product, and what obligations follow, depends on facts about that product and how it is placed on the EU market. This article explains the general framework; it is not legal advice, and organizations should consult counsel for their specific situation.",
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
          <div className="text-xs uppercase tracking-wide muted">Compliance</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Cyber Resilience Act and Container Images
          </h1>
          <p className="text-sm muted">Published August 17, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            The Cyber Resilience Act does not mention container images by name, but for any team
            shipping software packaged as containers into the EU market, the Act&apos;s component
            documentation and vulnerability-handling duties land squarely on what is inside those
            images. Here is what the CRA actually asks for and what it means in container terms.
          </p>
        </header>

        <img
          src="/blog/eu-cyber-resilience-act-containers.jpg"
          alt="EU Cyber Resilience Act and container images"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the CRA actually is</h2>
          <p className="text-sm muted">
            The Cyber Resilience Act is an EU regulation covering &ldquo;products with digital
            elements&rdquo; &mdash; a broad category spanning connected hardware and standalone
            software sold in the EU. It sets essential cybersecurity requirements that apply across
            a product&apos;s lifecycle: secure-by-design development, a documented approach to
            handling vulnerabilities, and truthful disclosure to users and regulators when things go
            wrong. It entered into force in December 2024, with obligations phasing in through 2027.
            This article covers the general framework only; consult counsel to determine how it
            applies to your specific product and market.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where container images fit in</h2>
          <p className="text-sm muted">
            The CRA does not regulate &ldquo;a container image&rdquo; as its own category &mdash; it
            regulates the product being placed on the market. But if that product is delivered,
            deployed, or operated as one or more container images, then every component inside those
            images &mdash; the base OS layer, language runtimes, and application dependencies &mdash;
            is part of what the manufacturer must document and monitor. A microservice shipped as a
            container is not exempt from the Act just because its packaging format is a tarball
            rather than an installer.
          </p>
          <p className="text-sm muted">
            In practice, this means the base image you choose is not purely a technical decision.
            An image built on a minimal, actively maintained base carries fewer components to
            document and monitor than one built on a large, general-purpose distribution. Our{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              comparison of Alpine, Debian, and distroless base images
            </Link>{" "}
            covers that tradeoff directly.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The core obligations, in container terms</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">CRA obligation</th>
                  <th className="text-left py-2 font-semibold">What it means for a container pipeline</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Component documentation (SBOM)</td>
                  <td className="py-2 align-top">Generate an SBOM for every image build, listing base OS and application-layer packages</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Vulnerability handling process</td>
                  <td className="py-2 align-top">Scan every image on a defined cadence, not just at initial release</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Timely remediation</td>
                  <td className="py-2 align-top">Rebuild and redeploy images promptly when a fix is available upstream</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Incident and exploited-vulnerability reporting</td>
                  <td className="py-2 align-top">Be able to determine quickly whether a newly disclosed CVE affects a deployed image</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Base images, third-party images, and who is responsible</h2>
          <p className="text-sm muted">
            A question that comes up quickly in container contexts: if a vulnerability lives in a
            public base image you did not author, is that your problem under the CRA? In practice,
            the manufacturer placing the finished product on the market carries the documentation
            and vulnerability-handling duty for everything shipped inside it, including a base image
            pulled from a public registry. The CRA does not distinguish between code you wrote and
            code you incorporated &mdash; it looks at the product as delivered. That is precisely why
            component-level visibility, not just visibility into your own application code, is the
            operational requirement here.
          </p>
          <p className="text-sm muted">
            This pushes base-image choice from a purely technical decision toward a compliance-relevant
            one. Fewer components mean less to document, less to monitor, and a smaller number of
            things that can go out of support upstream without your team noticing. A minimal or
            distroless base with a small, well-maintained package set is easier to keep in continuous
            compliance than a large, general-purpose image with hundreds of packages you never
            directly use.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why &ldquo;we patched it once&rdquo; is not enough</h2>
          <p className="text-sm muted">
            A container image that passed a scan at build time is not necessarily safe six months
            later. New CVEs are disclosed continuously against packages that have not changed at
            all, and the CRA&apos;s vulnerability-handling duty is framed around the product&apos;s
            supported lifetime, not a single point-in-time check. This is the same reason container
            images need rescanning on a schedule, independent of whether the application code has
            changed &mdash; the underlying OS packages accumulate newly disclosed vulnerabilities
            even when nothing in your own repository does.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Determine which of your products are &ldquo;placed on the market&rdquo; in the EU and
              therefore in CRA scope &mdash; and confirm this determination with counsel.
            </li>
            <li>
              Generate an SBOM for every container image build and store it alongside the image.
            </li>
            <li>
              Scan every deployed image on a recurring schedule, not only at build time, to catch
              CVEs disclosed after release.
            </li>
            <li>
              Track fix availability for base-image and dependency updates, and have a rebuild
              cadence rather than an ad-hoc one.
            </li>
            <li>
              Be able to answer &ldquo;are we affected&rdquo; for a newly disclosed CVE within
              hours, not days &mdash; that speed depends on having current SBOM and scan data on
              hand already.
            </li>
            <li>
              Document the process itself, not just the outputs &mdash; the CRA asks for an ongoing
              vulnerability-handling practice, not a one-time audit.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook supports this</h2>
          <p className="text-sm muted">
            ScanRook generates an enriched SBOM with every scan of a container image, and can be run
            on a recurring schedule against the same image so newly disclosed CVEs surface without
            waiting for the next code change. Because it queries OSV, NVD, and Red Hat OVAL in
            parallel, a &ldquo;are we affected&rdquo; question can be answered against current data
            rather than a database snapshot from the last build. Our{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              SBOM guide
            </Link>{" "}
            covers the generation and enrichment pipeline in full, and our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>{" "}
            covers hardening beyond vulnerability scanning alone.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the EU Cyber Resilience Act?</h3>
              <p className="text-sm muted mt-1">
                An EU regulation setting cybersecurity requirements &mdash; secure design, component
                documentation, vulnerability handling &mdash; for products with digital elements sold
                in the EU.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it apply to container images specifically?</h3>
              <p className="text-sm muted mt-1">
                It applies to the product, not the packaging format. If a regulated product is
                delivered as a container image, everything inside that image is in scope.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">When does the CRA take effect?</h3>
              <p className="text-sm muted mt-1">
                It entered into force in December 2024, with obligations phasing in and full
                enforcement reached in 2027; some reporting duties start earlier.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I consult a lawyer?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; applicability and obligations depend on your specific product and market;
                this article is not a substitute for legal advice.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Keep container SBOMs and scans current</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook generates enriched SBOMs and can rescan deployed images on a schedule, so your
            component documentation and vulnerability data stay current between builds.
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
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-15";

const title = `JFrog Xray: What It Does and How It Compares | ${APP_NAME}`;
const description =
  "JFrog Xray is an SCA and security tool built into Artifactory. What it does, its strengths and tradeoffs, and how it compares to a multi-source scanner.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "jfrog xray",
    "jfrog xray sca",
    "what is jfrog xray",
    "jfrog xray vs",
    "artifactory security scanning",
    "jfrog xray alternatives",
    "jfrog advanced security",
    "software composition analysis",
    "container scanning",
    "jfrog xray review",
  ],
  alternates: { canonical: "/blog/jfrog-xray" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/jfrog-xray",
    images: ["/blog/jfrog-xray.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/jfrog-xray.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "JFrog Xray: What It Does and How It Compares",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/jfrog-xray",
  image: "https://scanrook.io/blog/jfrog-xray.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is JFrog Xray?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JFrog Xray is a software composition analysis and security tool that integrates natively with JFrog Artifactory. It recursively scans the artifacts stored in Artifactory — container images, packages, and their dependency trees — for known vulnerabilities and license issues, and enforces security and compliance policies against builds and downloads.",
      },
    },
    {
      "@type": "Question",
      name: "What vulnerability data does JFrog Xray use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Xray matches components against JFrog's own curated vulnerability database, which combines public feeds such as the NVD with proprietary research from the JFrog Security Research team. That curation is a genuine strength, but like any single database it reflects one organization's coverage decisions, so results are best validated against your own artifacts.",
      },
    },
    {
      "@type": "Question",
      name: "Does JFrog Xray require Artifactory?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Xray is designed as part of the JFrog Platform and is tightly coupled to Artifactory as its source of artifacts and metadata. If your organization already standardizes on Artifactory as its binary repository, that integration is Xray's biggest advantage. If you do not use Artifactory, a standalone scanner is usually a better fit.",
      },
    },
    {
      "@type": "Question",
      name: "What is JFrog Advanced Security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JFrog Advanced Security is an add-on that extends Xray with capabilities such as contextual analysis of whether a vulnerability is applicable, secrets detection, infrastructure-as-code scanning, and exposure checks. It targets teams that want a broader application security suite inside the JFrog Platform rather than vulnerability matching alone.",
      },
    },
    {
      "@type": "Question",
      name: "How does JFrog Xray compare to open-source scanners?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Xray is a commercial tool whose main advantage is deep Artifactory integration and enterprise policy control. Open-source scanners like Trivy and Grype are free and standalone. ScanRook sits between them on model: a scanner focused on finding depth through multi-source enrichment. Which fits depends on whether you are buying into the JFrog Platform or want a portable, source-transparent scanner.",
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
          <div className="text-xs uppercase tracking-wide muted">Benchmarks</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            JFrog Xray: What It Does and How It Compares
          </h1>
          <p className="text-sm muted">Published November 15, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            If your organization runs JFrog Artifactory, you have probably been offered JFrog Xray as
            the security layer that sits on top of it. This is an honest look at what Xray does well,
            where its model constrains it, and how it compares to a standalone, multi-source scanner
            &mdash; including the cases where Xray is genuinely the right choice.
          </p>
        </header>

        <img
          src="/blog/jfrog-xray.jpg"
          alt="JFrog Xray compared to a multi-source scanner"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What JFrog Xray is</h2>
          <p className="text-sm muted">
            JFrog Xray is a software composition analysis (SCA) and security tool that is part of the
            JFrog Platform and integrates natively with{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              Artifactory
            </Link>
            , JFrog&apos;s universal binary repository. Its defining trait is that it scans artifacts
            where they already live. As images and packages are pushed to Artifactory, Xray indexes
            them, walks their dependency trees recursively, and flags known vulnerabilities and license
            problems &mdash; then lets you attach <em>policies</em> and <em>watches</em> that can fail a
            build, block a download, or raise an alert when something crosses a threshold.
          </p>
          <p className="text-sm muted">
            Because Artifactory is universal, Xray covers a wide spread of package types &mdash; Docker,
            Maven, npm, PyPI, NuGet, Go, RPM, Debian, and more &mdash; from one place. Its
            &ldquo;impact analysis&rdquo; traces a vulnerable component back through the dependency graph
            to show which of your builds and images actually include it, which is useful when a single
            bad transitive dependency is buried in dozens of artifacts.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Xray gets right</h2>
          <p className="text-sm muted">
            Credit where it is due, because it is earned. If Artifactory is already your system of
            record for binaries, Xray&apos;s integration is hard to beat: there is no separate export
            step, no second inventory to maintain, and scanning happens as a natural consequence of
            publishing. That coupling is the whole point.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Native Artifactory integration.</strong> Artifacts are scanned in place, with
              metadata JFrog already holds, across every repository type in one platform.
            </li>
            <li>
              <strong>Curated research.</strong> The JFrog Security Research team maintains a curated
              vulnerability database that layers proprietary analysis on top of public feeds like the NVD.
            </li>
            <li>
              <strong>Enterprise policy control.</strong> Watches and policies give large organizations
              a governance layer &mdash; gate promotions, block risky downloads, enforce license rules.
            </li>
            <li>
              <strong>Broad ecosystem.</strong> Add-ons under JFrog Advanced Security extend it toward
              contextual analysis, secrets, and IaC scanning for teams that want a suite.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Xray and ScanRook at a glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Dimension</th>
                  <th className="text-left py-2 pr-4 font-semibold">JFrog Xray</th>
                  <th className="text-left py-2 font-semibold">ScanRook</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Model</td>
                  <td className="py-2 pr-4 align-top">Commercial, platform add-on</td>
                  <td className="py-2 align-top">Free tier + paid, standalone</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Primary integration</td>
                  <td className="py-2 pr-4 align-top">Coupled to Artifactory</td>
                  <td className="py-2 align-top">Any image, binary, or source archive; CLI + API</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Vulnerability data</td>
                  <td className="py-2 pr-4 align-top">JFrog curated database</td>
                  <td className="py-2 align-top">Multi-source: OSV, NVD, Red Hat OVAL in parallel</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Best when</td>
                  <td className="py-2 pr-4 align-top">You standardize on the JFrog Platform</td>
                  <td className="py-2 align-top">You want portable, source-transparent finding depth</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Scope beyond SCA</td>
                  <td className="py-2 pr-4 align-top">Advanced Security add-on (IaC, secrets, contextual)</td>
                  <td className="py-2 align-top">Container / binary / source focus; no IaC scanning</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The architectural difference: one database vs many</h2>
          <p className="text-sm muted">
            Xray&apos;s scanning matches components against a single curated database. That keeps
            results consistent and fast, and JFrog&apos;s research adds real value on top of public
            feeds. The tradeoff is inherent to any single-source model: what one database does not carry,
            it cannot report. ScanRook takes the opposite bet &mdash; it queries OSV, NVD, and Red Hat
            OVAL in parallel for every package, on the theory that different databases know about
            different advisories.
          </p>
          <p className="text-sm muted">
            We cannot show you Xray finding counts here &mdash; it was not part of our public benchmark,
            and it would be dishonest to invent numbers for it. What we <em>can</em> show is how much the
            single-database versus multi-source choice moves results among the tools we did test. From{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>{" "}
            (warm cache; ScanRook v1.14.2, Trivy 0.69.1, Grype 0.109.0; unique CVE IDs on nginx:1.27):
          </p>

          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 210" className="w-full" role="img" aria-label="Unique CVE findings on nginx:1.27 from the 2026 benchmark: ScanRook 2,952, Trivy 314, Grype 315. JFrog Xray was not part of this benchmark.">
              <text x="10" y="22" fill="currentColor" fontSize="12" fontWeight="600">Unique CVE findings on nginx:1.27</text>
              <g fontSize="12" fontWeight="600" fill="currentColor" textAnchor="end">
                <text x="104" y="62">ScanRook</text>
                <text x="104" y="112">Trivy</text>
                <text x="104" y="162">Grype</text>
              </g>
              <rect x="118" y="44" width="520" height="30" rx="4" fill="var(--dg-accent,#2563eb)" />
              <rect x="118" y="94" width="55" height="30" rx="4" fill="currentColor" fillOpacity="0.35" />
              <rect x="118" y="144" width="56" height="30" rx="4" fill="currentColor" fillOpacity="0.35" />
              <g fontSize="12" fontWeight="700" fill="currentColor">
                <text x="646" y="64">2,952</text>
                <text x="181" y="114">314</text>
                <text x="182" y="164">315</text>
              </g>
              <text x="10" y="198" fill="currentColor" fillOpacity="0.7" fontSize="11">Source: ScanRook 2026 benchmark. JFrog Xray was not tested; it uses its own curated database.</text>
            </svg>
          </div>

          <p className="text-sm muted">
            The gap between 314 and 2,952 is architecture, not effort &mdash; a single aggregated
            database versus parallel queries across several. That is the lens to apply to Xray too: its
            curated feed is a strength, and also a single source. The only way to know what it surfaces
            on your images is to scan them and compare, which is exactly what we recommend doing with any
            scanner, including ours. Our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            shows how differently the major sources cover the same packages.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you pick?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Pick JFrog Xray</strong> if Artifactory is your binary system of record and you
              want scanning, policy, and governance woven into the platform you already run. The
              integration and enterprise controls are the reason to buy it, and for JFrog shops they are
              compelling.
            </li>
            <li>
              <strong>Pick a standalone open-source scanner</strong> (Trivy, Grype) if you want free,
              portable image scanning with no platform commitment and speed is the priority. See our{" "}
              <Link href="/compare/trivy" className="underline">ScanRook vs Trivy</Link> page for that
              tradeoff.
            </li>
            <li>
              <strong>Pick ScanRook</strong> if finding depth is the requirement and you do not want to
              be tied to one repository platform or one vulnerability database &mdash; multi-source
              enrichment with each finding tagged by source and confidence tier, runnable on any image,
              binary, or source archive.
            </li>
            <li>
              <strong>Run more than one</strong> where the stakes justify it. A platform-integrated
              scanner for governance and a deep multi-source scanner for audits are not redundant; they
              answer different questions.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits alongside Xray</h2>
          <p className="text-sm muted">
            These tools are not mutually exclusive. Plenty of teams keep Xray for its Artifactory
            governance &mdash; watches, license policies, promotion gates &mdash; and add ScanRook where
            they need a second, independent read on finding depth: a security review, a compliance audit,
            or a spot check on a critical image. Because ScanRook runs on any exported artifact and tags
            every finding with its source, it is easy to diff its results against Xray&apos;s and see
            precisely where the two databases diverge, rather than trusting either one blindly. License
            questions are similar &mdash; our{" "}
            <Link href="/blog/open-source-license-compliance-guide" className="underline">
              open-source license compliance guide
            </Link>{" "}
            covers how component inventories feed that workflow.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is JFrog Xray free?</h3>
              <p className="text-sm muted mt-1">
                No. Xray is a commercial product within the JFrog Platform, licensed alongside
                Artifactory. Its value proposition is enterprise integration and governance rather than
                being a free standalone tool.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can Xray scan images outside Artifactory?</h3>
              <p className="text-sm muted mt-1">
                Xray is built around Artifactory as its artifact source. If your workflow does not center
                on Artifactory, a standalone scanner that runs on any exported image or archive is usually
                the more natural fit.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Xray do more than vulnerability scanning?</h3>
              <p className="text-sm muted mt-1">
                Yes. It handles license compliance and policy enforcement, and the JFrog Advanced Security
                add-on extends it to contextual analysis, secrets, and IaC. Scope beyond SCA depends on
                which tier you license.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I compare Xray to another scanner fairly?</h3>
              <p className="text-sm muted mt-1">
                Scan the same real images with both, then read the diff finding by finding: is the package
                installed, is there a fix, and which source knew about it. That tells you whether a gap is
                a one-off or a structural database difference.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Get a second, source-transparent read on your images</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook matches every package against OSV, NVD, and Red Hat OVAL in parallel and tags each
            finding with its source and confidence tier &mdash; so you can diff it against Xray and see
            exactly where the databases diverge, on any image you can export.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/compare/snyk" className="btn-secondary">Compare scanners</Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              Vulnerability Scanner Benchmark 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is SCA?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

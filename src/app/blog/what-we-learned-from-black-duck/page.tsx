import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `What We Learned from Black Duck (And How We Made License Scanning Better) | ${APP_NAME}`;
const description =
  "How Black Duck pioneered license scanning with snippet matching and proprietary databases, what has changed since 2005, and how modern tools deliver the same results at a fraction of the cost.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Black Duck alternative",
    "open source license scanner",
    "snippet matching",
    "code fingerprint",
    "license compliance tool",
    "SCA license detection",
    "software composition analysis",
    "Black Duck vs ScanRook",
  ],
  alternates: {
    canonical: "/blog/what-we-learned-from-black-duck",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/what-we-learned-from-black-duck",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline:
    "What We Learned from Black Duck (And How We Made License Scanning Better)",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/what-we-learned-from-black-duck",
  datePublished: "2026-04-19",
  dateModified: "2026-04-19",
};

export default function BlackDuckPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            License Compliance
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            What We Learned from Black Duck (And How We Made License Scanning
            Better)
          </h1>
          <p className="text-sm muted">
            Black Duck Software -- now part of Synopsys -- invented the
            commercial open source license scanning category in 2003. For two
            decades, their approach defined how enterprises managed open source
            compliance. We studied their methods carefully before building{" "}
            {APP_NAME}. Here is what we learned, what has changed since they
            started, and why we think the economics of license scanning have
            fundamentally shifted.
          </p>
          <time className="text-xs muted">April 19, 2026</time>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How Black Duck Built the Category
          </h2>
          <p className="text-sm muted">
            When Black Duck launched in 2003, open source was still viewed with
            suspicion by most enterprises. SCO was suing IBM for $1 billion
            over alleged Linux copyright violations. Companies were terrified
            that their codebases might contain GPL-licensed code that could
            force them to release proprietary source code. Black Duck saw the
            opportunity and built a product to address it.
          </p>
          <p className="text-sm muted">
            Their approach was technically impressive for its era: crawl every
            public source code repository on the internet, compute
            cryptographic hashes for code snippets at multiple granularities
            (function level, block level, file level), and build a massive
            proprietary fingerprint database called the KnowledgeBase. When a
            customer wanted to scan their codebase, Black Duck would hash their
            source code at the same granularities and match against the
            KnowledgeBase. Any matches revealed open source code -- and its
            license -- that had been copied into the proprietary codebase.
          </p>
          <p className="text-sm muted">
            This snippet-matching approach solved a real problem: developers
            copy-paste code from Stack Overflow, vendor packages without
            attribution, and fork libraries without preserving license files.
            Package manifest scanning alone cannot detect this. You need to
            look at the actual code. Black Duck&apos;s KnowledgeBase grew to
            cover billions of code snippets across millions of repositories,
            and their scanning accuracy was genuinely best-in-class.
          </p>
          <p className="text-sm muted">
            The business model was equally straightforward: the KnowledgeBase
            was proprietary and expensive to build, so Black Duck charged
            accordingly. Enterprise licenses typically started at $100,000 per
            year and scaled into the millions for large organizations. M&A due
            diligence scans -- a common use case where an acquiring company
            audits the target&apos;s open source usage -- could cost $50,000 to
            $150,000 per engagement.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            What Has Changed Since 2005
          </h2>
          <p className="text-sm muted">
            Black Duck&apos;s moat was data: they had the largest database of
            open source code fingerprints, and building a competing database
            required years of crawling and indexing. But the world has changed
            dramatically since 2005, and the barriers to building license
            scanning capabilities have dropped by orders of magnitude.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Package registries provide license metadata for free
          </h3>
          <p className="text-sm muted">
            In 2005, many open source packages were distributed as tarballs on
            personal websites. Today, npm, PyPI, crates.io, Maven Central,
            RubyGems, and every other major package registry require (or
            strongly encourage) license declarations in structured metadata.
            The npm registry alone contains license data for over 3 million
            packages. You do not need a proprietary database to know that React
            is MIT-licensed -- it says so in{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
              package.json
            </code>
            .
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Software Heritage has indexed the world&apos;s source code
          </h3>
          <p className="text-sm muted">
            The{" "}
            <a
              href="https://www.softwareheritage.org/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Software Heritage
            </a>{" "}
            initiative, launched by Inria and UNESCO, has archived over 18
            billion unique source files from 300 million repositories across
            GitHub, GitLab, Bitbucket, and other forges. Their archive is
            freely accessible via API. What was once Black Duck&apos;s most
            valuable proprietary asset -- a comprehensive index of the
            world&apos;s open source code -- now exists as a public good.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            ScanCode provides 1,800+ license patterns under Apache-2.0
          </h3>
          <p className="text-sm muted">
            The{" "}
            <a
              href="https://github.com/nexB/scancode-toolkit"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              ScanCode Toolkit
            </a>{" "}
            by nexB contains over 1,800 license detection rules covering
            license texts, notices, tags, and URLs. It is Apache-2.0 licensed.
            The{" "}
            <a
              href="https://clearlydefined.io/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              ClearlyDefined
            </a>{" "}
            project, backed by the Open Source Initiative, provides curated
            license data for millions of packages via a free API. Together,
            these tools cover the vast majority of license detection scenarios
            that Black Duck&apos;s KnowledgeBase was built to handle.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            MinHash makes fuzzy matching practical without proprietary data
          </h3>
          <p className="text-sm muted">
            Black Duck&apos;s snippet matching relied on exact and near-exact
            hash comparisons. Modern fuzzy matching techniques like MinHash and
            SimHash enable detecting code similarity even when the copied code
            has been reformatted, variable-renamed, or partially modified.
            These algorithms are well-documented in academic literature and can
            be implemented against any code corpus -- you do not need a
            proprietary database to use them.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How {APP_NAME} Approaches License Scanning
          </h2>
          <p className="text-sm muted">
            We designed {APP_NAME}&apos;s license scanning to take advantage of
            everything that has changed since Black Duck&apos;s founding. Our
            approach is layered, starting with the most reliable and
            cheapest-to-compute methods and falling back to more sophisticated
            techniques only when necessary.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Layer 1: Package metadata extraction (free, instant)
          </h3>
          <p className="text-sm muted">
            For containerized applications -- which represent the majority of
            modern deployments -- {APP_NAME} reads license data directly from
            package manager databases. RPM headers, APK metadata, dpkg
            copyright files, npm{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
              package.json
            </code>
            , pip METADATA files, and Cargo.toml all contain structured license
            fields. This covers 90%+ of packages with zero external API calls
            and sub-second processing time per package. See our{" "}
            <Link
              href="/docs/concepts/license-scanning"
              className="font-medium underline underline-offset-2"
            >
              license scanning documentation
            </Link>{" "}
            for the full list of supported ecosystems.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Layer 2: ClearlyDefined API for gaps (free, fast)
          </h3>
          <p className="text-sm muted">
            When package metadata is missing or ambiguous, {APP_NAME} queries
            the ClearlyDefined API, which provides curated license data for
            millions of packages. ClearlyDefined data is community-reviewed
            and freely available. This fills gaps without requiring any
            proprietary database.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Layer 3: License text pattern matching (local, fast)
          </h3>
          <p className="text-sm muted">
            For source code tarballs and repositories where structured metadata
            is not available, {APP_NAME} scans LICENSE, COPYING, NOTICE, and
            README files using pattern matching against known license texts.
            This detects licenses even when packages do not include metadata
            files, covering cases like vendored dependencies and copy-pasted
            code.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Normalization to SPDX
          </h3>
          <p className="text-sm muted">
            Every detected license is normalized to its{" "}
            <a
              href="https://spdx.org/licenses/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              SPDX identifier
            </a>
            . This means that Fedora&apos;s &quot;ASL 2.0&quot;, npm&apos;s
            &quot;Apache-2.0&quot;, and PyPI&apos;s &quot;License :: OSI
            Approved :: Apache Software License&quot; all resolve to the same{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
              Apache-2.0
            </code>{" "}
            identifier. Consistent normalization is essential for policy
            evaluation across heterogeneous dependency trees.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Why Integrated Beats Standalone
          </h2>
          <p className="text-sm muted">
            Black Duck is a license-only tool (though Synopsys has added
            vulnerability scanning post-acquisition). FOSSA is primarily a
            license compliance tool that bolted on basic vulnerability
            detection. Both treat license scanning and vulnerability scanning
            as separate problems with separate tools, separate dashboards, and
            separate pricing.
          </p>
          <p className="text-sm muted">
            We think this separation is artificial. When you scan a container
            image, you want to know three things: (1) what is inside it
            (SBOM), (2) is any of it vulnerable (CVE scanning), and (3) are
            any of the licenses a problem (license compliance). These are three
            views of the same underlying data -- the list of packages and their
            metadata. Running three separate tools against the same artifact
            means parsing the same package databases three times, maintaining
            three sets of credentials, reconciling three different package name
            formats, and paying three vendors.
          </p>
          <p className="text-sm muted">
            {APP_NAME} produces all three outputs from a single scan.
            Vulnerabilities, licenses, and SBOM data come from the same
            package parsing pass, using the same package identifiers, in the
            same report. License policies and vulnerability severity thresholds
            can be evaluated together -- because a low-severity CVE in a
            GPL-3.0 package might warrant more attention than a medium-severity
            CVE in an MIT package, since the GPL package carries both security
            and legal risk.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            The Cost Comparison
          </h2>
          <p className="text-sm muted">
            Black Duck (Synopsys SCA) pricing is not publicly listed, but
            industry reports and customer accounts consistently put it in the
            $100,000-$500,000/year range for enterprise licenses. FOSSA
            pricing starts around $20,000/year for small teams and scales into
            six figures for enterprise. Both require multi-year contracts and
            professional services engagements for onboarding.
          </p>
          <p className="text-sm muted">
            {APP_NAME} provides license scanning, vulnerability scanning, and
            SBOM generation at a fraction of that cost. The free tier includes
            license detection for every scan. The Pro tier adds policy
            enforcement and compliance reporting. For organizations that need
            self-hosted deployment in air-gapped environments -- a common
            requirement in defense and financial services -- {APP_NAME}{" "}
            <Link
              href="/docs/self-hosted"
              className="font-medium underline underline-offset-2"
            >
              self-hosted
            </Link>{" "}
            provides the same capabilities without sending any data to external
            services.
          </p>
          <p className="text-sm muted">
            This is not a criticism of Black Duck -- they built something
            genuinely pioneering, and their KnowledgeBase was worth every penny
            when the alternatives were manual code audits. But the world has
            changed. The data that made their approach expensive is now freely
            available, the algorithms are well-understood, and the package
            ecosystem has standardized on structured license metadata. The
            economics of license scanning no longer justify six-figure annual
            fees.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            When You Still Need Black Duck
          </h2>
          <p className="text-sm muted">
            We believe in honest comparisons. There are scenarios where Black
            Duck (Synopsys SCA) remains the better choice:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>M&A due diligence audits</strong> where the acquiring
              company&apos;s legal team requires a report from a recognized
              brand name. Synopsys&apos;s reputation carries weight in
              boardrooms in a way that newer tools do not yet match.
            </li>
            <li>
              <strong>Snippet-level detection</strong> of copied code that was
              vendored without any package manager. If developers copy-pasted
              GPL-licensed code into a proprietary codebase without any
              package.json or Cargo.toml, metadata-based scanning will miss
              it. Black Duck&apos;s snippet matching is still best-in-class for
              this use case.
            </li>
            <li>
              <strong>Existing enterprise contracts</strong> where switching
              costs exceed the price difference. If your organization has
              already invested in Black Duck integration, custom policies, and
              team training, the migration cost may not be justified.
            </li>
          </ul>
          <p className="text-sm muted">
            For everything else -- container scanning, CI/CD pipeline
            integration, ongoing compliance monitoring, and new projects
            starting from scratch -- we think the integrated, metadata-first
            approach delivers better results at a fundamentally lower cost.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Try It
          </h2>
          <p className="text-sm muted">
            {APP_NAME}&apos;s license scanning is available on every plan,
            including the free tier. Upload a container image or source archive,
            and you will see the complete license inventory alongside
            vulnerabilities and SBOM data -- all from a single scan.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link className="btn-secondary" href="/dashboard">
              Start scanning
            </Link>
            <Link className="btn-secondary" href="/docs/concepts/license-scanning">
              License scanning docs
            </Link>
            <Link className="btn-secondary" href="/docs/concepts/license-types">
              License types reference
            </Link>
            <Link className="btn-secondary" href="/pricing">
              View pricing
            </Link>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Further Reading
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              className="btn-secondary"
              href="/blog/open-source-license-compliance-guide"
            >
              License compliance guide
            </Link>
            <Link
              className="btn-secondary"
              href="/blog/what-is-sbom-and-how-scanrook-uses-it"
            >
              What is an SBOM?
            </Link>
            <Link className="btn-secondary" href="/blog">
              Back to blog
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}

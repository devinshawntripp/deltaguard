import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-05";

const title = `The SLSA Framework Explained: Levels and Provenance | ${APP_NAME}`;
const description =
  "What the SLSA framework is, how its build levels and provenance work, what it does and does not protect against, and how it fits alongside SBOMs.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "slsa framework",
    "slsa levels",
    "slsa provenance",
    "supply chain levels for software artifacts",
    "slsa build track",
    "software supply chain security",
    "build provenance attestation",
    "slsa vs sbom",
    "in-toto attestation",
    "slsa compliance",
  ],
  alternates: { canonical: "/blog/slsa-framework-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/slsa-framework-explained",
    images: ["/blog/slsa-framework-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/slsa-framework-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "The SLSA Framework Explained: Levels and Provenance",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/slsa-framework-explained",
  image: "https://scanrook.io/blog/slsa-framework-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the SLSA framework?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SLSA (Supply-chain Levels for Software Artifacts, pronounced salsa) is a security framework maintained under the OpenSSF at the Linux Foundation. It defines a set of graded requirements for producing tamper-resistant build provenance, so a consumer can verify how a software artifact was built and by whom. Version 1.0 was released in April 2023.",
      },
    },
    {
      "@type": "Question",
      name: "What are the SLSA build levels?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The SLSA v1.0 Build track defines four levels. Build L0 has no guarantees. Build L1 means provenance exists describing how the artifact was built. Build L2 means that provenance is signed by a hosted build platform. Build L3 means the build platform is hardened, so builds are isolated and the provenance cannot be falsified by the build steps.",
      },
    },
    {
      "@type": "Question",
      name: "Does SLSA protect against vulnerable dependencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. SLSA addresses the integrity of the build process, not the security of what is built. A perfectly attested SLSA Build L3 artifact can still contain a dependency with a known critical CVE. SLSA tells you the build was not tampered with; it does not tell you the contents are free of known vulnerabilities, which is a separate scan.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between SLSA and an SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An SBOM is an inventory of what is inside an artifact; SLSA provenance is a record of how the artifact was produced. They answer different questions and are complementary. Provenance says the build came from a trusted process; the SBOM says which components ended up in it, which you then scan for vulnerabilities.",
      },
    },
    {
      "@type": "Question",
      name: "Is SLSA a legal or regulatory requirement?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SLSA itself is an industry framework, not a law. It is referenced in supply-chain security guidance and procurement discussions, and elements of it align with frameworks like the NIST SSDF. Whether adopting a specific SLSA level satisfies a particular contractual or regulatory obligation is a question for your compliance team and counsel.",
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
            The SLSA Framework Explained: Levels and Provenance
          </h1>
          <p className="text-sm muted">Published September 5, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            The SLSA framework &mdash; Supply-chain Levels for Software Artifacts, pronounced
            &ldquo;salsa&rdquo; &mdash; is one of the most cited and most misunderstood pieces of
            supply-chain security. It is not a scanner, not a checklist of secure-coding rules, and
            not a guarantee your software is free of vulnerabilities. It is a graded standard for
            proving <em>how</em> a build happened. Here is what it actually covers, what its levels
            mean, and where it stops &mdash; because knowing the boundary is what makes it useful.
          </p>
        </header>

        <img
          src="/blog/slsa-framework-explained.jpg"
          alt="The SLSA framework build levels and provenance"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem SLSA was built to solve</h2>
          <p className="text-sm muted">
            SLSA is maintained as an OpenSSF project under the Linux Foundation, with version 1.0
            published in April 2023. It exists because of a specific category of attack: not a
            vulnerable dependency, but a <strong>compromised build</strong>. The high-profile
            example is a tampered build pipeline that injects malicious code into an otherwise
            legitimate artifact, so consumers install a signed, official-looking package that was
            quietly altered on the way out the door. No amount of source review or dependency
            scanning catches that, because the source and the dependencies were fine &mdash; the
            build was subverted.
          </p>
          <p className="text-sm muted">
            SLSA&apos;s answer is <strong>provenance</strong>: a verifiable record of how an artifact
            was produced, including which source it came from, which build system ran, and what
            inputs went in. If you can verify that provenance, you can detect an artifact that did
            not come from your trusted pipeline &mdash; even if it is signed and looks correct.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Provenance and attestations</h2>
          <p className="text-sm muted">
            The mechanism is an <strong>attestation</strong>: signed, machine-readable metadata about
            an artifact. SLSA provenance is expressed using the in-toto attestation format, and it
            records the build&apos;s subject (the artifact and its digest), the builder identity, and
            the build definition &mdash; the source repository, entry point, and parameters. A
            consumer, or an automated policy, verifies the signature and checks that the provenance
            matches what they expect before trusting the artifact.
          </p>
          <p className="text-sm muted">
            Provenance pairs naturally with a Software Bill of Materials. The two describe different
            things: provenance is the record of <em>how</em> the artifact was made, while an SBOM is
            the inventory of <em>what</em> is inside it. If you are newer to the inventory side,{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              our SBOM guide
            </Link>{" "}
            explains where it fits.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The Build track levels</h2>
          <p className="text-sm muted">
            SLSA v1.0 is organized into <strong>tracks</strong>, and the one specified today is the
            Build track. It defines four levels of increasing rigor:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Level</th>
                  <th className="text-left py-2 pr-4 font-semibold">Requirement</th>
                  <th className="text-left py-2 font-semibold">What it protects against</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Build L0</strong></td>
                  <td className="py-2 pr-4 align-top">No guarantees</td>
                  <td className="py-2 align-top">Nothing; the baseline</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Build L1</strong></td>
                  <td className="py-2 pr-4 align-top">Provenance exists and is available</td>
                  <td className="py-2 align-top">Mistakes and undocumented builds; enables basic checks</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Build L2</strong></td>
                  <td className="py-2 pr-4 align-top">Signed provenance from a hosted build platform</td>
                  <td className="py-2 align-top">Tampering after the build; forged provenance</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Build L3</strong></td>
                  <td className="py-2 pr-4 align-top">Hardened build platform, isolated runs</td>
                  <td className="py-2 align-top">Tampering during the build; cross-build interference</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Read the levels as a ladder of trust. L1 means someone wrote down how the build happened.
            L2 means a hosted platform generated and <em>signed</em> that record, so it is harder to
            forge. L3 means the platform itself is hardened &mdash; build runs are isolated from one
            another and the signing material is out of reach of the build steps, so the provenance
            cannot be falsified from inside the build. Higher levels demand more of your
            infrastructure, which is why most teams start at L1 and climb.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A note on the numbering</h2>
          <p className="text-sm muted">
            If you read older SLSA material you may see references to four numbered levels spanning
            source and build requirements together. That was the pre-1.0 design (SLSA 0.1). Version
            1.0 restructured the framework into tracks and scoped the initial specification to build
            integrity, which is why today&apos;s Build track runs L0 through L3 rather than up to a
            &ldquo;level 4.&rdquo; Additional tracks, such as a Source track, are described as future
            work. If a policy or vendor claim cites a SLSA level, check which version and track it
            refers to, because the numbers are not interchangeable across spec versions.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What SLSA does not do</h2>
          <p className="text-sm muted">
            This is the part most worth internalizing. <strong>SLSA is about build integrity, not
            content security.</strong> A SLSA Build L3 artifact has strong, verifiable provenance
            &mdash; and it can still contain a dependency with a known critical CVE. The framework
            proves the build was not tampered with; it says nothing about whether the components you
            deliberately included are themselves vulnerable. Provenance verification and vulnerability
            scanning answer different questions, and passing one does not cover the other.
          </p>
          <p className="text-sm muted">
            The same boundary applies to secrets, license obligations, and misconfiguration &mdash;
            all outside SLSA&apos;s scope. Treat SLSA as the answer to &ldquo;can I trust where this
            came from?&rdquo; and pair it with an inventory-and-scan step that answers &ldquo;is what
            is inside it safe to run?&rdquo; A tool like VEX then helps you record which of those
            vulnerabilities are actually exploitable in your context; see{" "}
            <Link href="/blog/vex-explained" className="underline">our VEX explainer</Link>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">SLSA and the regulatory picture</h2>
          <p className="text-sm muted">
            SLSA is an industry framework, not a statute. It is frequently referenced in
            supply-chain security guidance, and its provenance goals align with government efforts
            like the NIST Secure Software Development Framework and broader procurement expectations
            for attestable builds. Regulations such as the{" "}
            <Link href="/blog/eu-cyber-resilience-act-containers" className="underline">
              EU Cyber Resilience Act
            </Link>{" "}
            and evolving SBOM mandates push in the same direction &mdash; provable, documented
            software supply chains &mdash; without necessarily naming SLSA itself.
          </p>
          <p className="text-sm muted">
            Because the mapping between a SLSA level and any specific legal obligation is not
            one-to-one, treat &ldquo;does SLSA Build L2 satisfy requirement X&rdquo; as a question
            for your compliance team and counsel, not something to infer from a blog post. Our{" "}
            <Link href="/blog/sbom-requirements-2026" className="underline">
              2026 SBOM requirements map
            </Link>{" "}
            covers the adjacent obligations that most often travel with provenance expectations.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook sits on the content-security side of the line, not the provenance side. It does
            not generate SLSA provenance or verify attestations &mdash; that is the job of your build
            platform and a policy verifier. What ScanRook does is scan the artifact SLSA vouches for:
            it reads the OS packages and language dependencies (npm, pip, Go, Cargo, Maven, and
            more) inside a container or source tree and matches them against OSV, NVD, and Red Hat
            OVAL, and it emits an SBOM you can attach alongside your provenance.
          </p>
          <p className="text-sm muted">
            The two fit together cleanly: SLSA proves the artifact came from your trusted pipeline,
            and ScanRook tells you whether what is inside it carries known vulnerabilities. Neither
            replaces the other, and a mature supply-chain program wants both.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the SLSA framework?</h3>
              <p className="text-sm muted mt-1">
                An OpenSSF framework that defines graded requirements for producing tamper-resistant
                build provenance, so a consumer can verify how an artifact was built. Version 1.0
                shipped in April 2023.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are the build levels?</h3>
              <p className="text-sm muted mt-1">
                Build L0 (none), L1 (provenance exists), L2 (signed provenance from a hosted
                platform), and L3 (hardened, isolated builds with non-falsifiable provenance).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does SLSA catch vulnerable dependencies?</h3>
              <p className="text-sm muted mt-1">
                No. It secures the build process, not the contents. A SLSA L3 artifact can still ship
                a known-vulnerable package; that requires a separate scan.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">SLSA vs SBOM?</h3>
              <p className="text-sm muted mt-1">
                Provenance records how an artifact was built; an SBOM inventories what is inside it.
                They are complementary, not substitutes.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan what your provenance vouches for</h3>
          <p className="text-sm muted leading-relaxed">
            SLSA proves the build was not tampered with; ScanRook tells you whether what shipped
            carries known vulnerabilities. Scan a container or source tree against OSV, NVD, and
            vendor advisory data, and export an SBOM to pair with your provenance.
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
            <Link href="/blog/sbom-requirements-2026" className="underline">
              SBOM Requirements in 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/eu-cyber-resilience-act-containers" className="underline">
              The EU Cyber Resilience Act and Container Images
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

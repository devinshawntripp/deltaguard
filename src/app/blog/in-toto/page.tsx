import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-20";

const title = `in-toto Explained: Securing the Software Supply Chain | ${APP_NAME}`;
const description =
  "in-toto is a framework that secures the software supply chain by signing and verifying each build step, so you can prove an artifact was built as intended.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "in-toto",
    "in-toto framework",
    "in-toto attestation",
    "software supply chain security",
    "supply chain attestation",
    "in-toto vs slsa",
    "build provenance",
    "in-toto layout",
    "link metadata",
    "cncf supply chain",
  ],
  alternates: { canonical: "/blog/in-toto" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/in-toto",
    images: ["/blog/in-toto.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/in-toto.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "in-toto Explained: Securing the Software Supply Chain",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/in-toto",
  image: "https://scanrook.io/blog/in-toto.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is in-toto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "in-toto is an open-source framework for securing the integrity of a software supply chain. It lets a project owner define, in a signed policy, exactly which steps produce a release and who is authorized to perform each one. Every step emits signed metadata, and a verifier checks the finished artifact against the policy before it is trusted. It originated at NYU's Secure Systems Lab and is a CNCF project.",
      },
    },
    {
      "@type": "Question",
      name: "How does in-toto work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The project owner signs a layout that lists the ordered steps of the supply chain, the functionaries allowed to run each step, and the expected materials and products. As the pipeline runs, each step produces signed link metadata recording the hashes of its inputs and outputs. Verification confirms that every step was signed by an authorized key and that artifacts flowed correctly from one step to the next.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between in-toto and SLSA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SLSA is a set of levels and requirements for build integrity; in-toto is a concrete framework and metadata format that can satisfy them. SLSA build provenance is expressed as an in-toto attestation, so the two are complementary rather than competing: SLSA says what assurances you need, and in-toto provides a signed, verifiable way to record and check them.",
      },
    },
    {
      "@type": "Question",
      name: "What is an in-toto attestation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An in-toto attestation is a signed statement about one or more software artifacts. It has a subject that names the artifacts by cryptographic digest and a predicate that carries the claim, such as SLSA provenance, an SBOM, or test results. The standardized format lets tools like Sigstore, SLSA, and various CI systems produce and consume interoperable supply-chain metadata.",
      },
    },
    {
      "@type": "Question",
      name: "Does in-toto replace vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. in-toto proves that an artifact was built by the right people through the expected steps, but it says nothing about whether the packages inside that artifact contain known CVEs. You still need a scanner to inspect the finished image or binary. The two fit together: a scanner's SBOM and vulnerability results can be carried as an in-toto attestation predicate.",
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
            in-toto Explained: Securing the Software Supply Chain
          </h1>
          <p className="text-sm muted">Published October 20, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Most supply-chain attacks do not break your code &mdash; they tamper with the pipeline
            that builds and ships it. in-toto is a framework for making that pipeline verifiable:
            you declare the steps a release must go through, sign what each step produces, and let a
            verifier confirm nothing was skipped, swapped, or slipped in. Here is how it works and
            where it fits alongside scanning.
          </p>
        </header>

        <img
          src="/blog/in-toto.jpg"
          alt="in-toto software supply chain framework"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem in-toto solves</h2>
          <p className="text-sm muted">
            A modern release passes through many hands: source control, a build server, a test
            stage, a packaging step, a registry push. Each hop is a place where an attacker could
            substitute a malicious artifact, and a signature on the final binary alone tells you
            nothing about what happened in the middle. The 2020 SolarWinds compromise was exactly
            this shape of attack &mdash; the source was clean, but a build-time implant made it into
            the shipped product. in-toto exists to make each hop accountable, so the party consuming
            the software can verify the whole chain, not just the last link.
          </p>
          <p className="text-sm muted">
            in-toto was created at New York University&apos;s Secure Systems Lab and is now a CNCF
            project. It sits inside the broader movement toward{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            , alongside signing and provenance efforts that all try to answer one question: can you
            trust how this artifact came to be?
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The core building blocks</h2>
          <p className="text-sm muted">
            in-toto has a small vocabulary. Learn four terms and the model clicks:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Layout</strong> &mdash; a signed policy from the project owner. It lists the
              ordered steps of the supply chain, which keys are authorized to perform each step, and
              the expected materials (inputs) and products (outputs) at each stage. It can also
              define <em>inspections</em> that run at verification time.
            </li>
            <li>
              <strong>Functionaries</strong> &mdash; the people or automated tools that carry out
              steps. Each holds a signing key. A functionary might be a developer, a CI runner, or a
              packaging service.
            </li>
            <li>
              <strong>Link metadata</strong> &mdash; the signed record a functionary produces when
              it runs a step. A link captures the cryptographic hashes of everything the step
              consumed and everything it produced, plus the command that ran.
            </li>
            <li>
              <strong>Verification</strong> &mdash; the final check. Given the layout and all the
              collected links, a verifier confirms each step was signed by an authorized key, that
              the products of one step match the materials of the next, and that inspections pass.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How a verified chain looks</h2>
          <p className="text-sm muted">
            Imagine a three-step chain: clone the source, build a binary, package it into a
            container. The owner signs a layout up front. Each step runs, records what it touched,
            and signs a link. At the end, the consumer verifies the artifact against the layout and
            the links before trusting it.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 210" width="100%" role="img" aria-label="in-toto supply chain flow: a signed layout governs three steps, each producing signed link metadata, ending in verification">
              <text x="10" y="24" fontSize="13" fill="currentColor" fontWeight="600">Signed layout (policy: steps, keys, expected artifacts)</text>
              <line x1="10" y1="34" x2="710" y2="34" stroke="var(--dg-accent,#2563eb)" strokeWidth="2" />
              {[
                { x: 20, label: "1. Clone", sub: "source" },
                { x: 260, label: "2. Build", sub: "binary" },
                { x: 500, label: "3. Package", sub: "container" },
              ].map((s) => (
                <g key={s.x}>
                  <rect x={s.x} y="70" width="200" height="56" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
                  <text x={s.x + 16} y="95" fontSize="14" fill="currentColor" fontWeight="600">{s.label}</text>
                  <text x={s.x + 16} y="114" fontSize="12" fill="currentColor" fillOpacity="0.7">produces {s.sub}</text>
                  <rect x={s.x + 30} y="150" width="140" height="30" rx="6" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                  <text x={s.x + 100} y="169" fontSize="11" fill="currentColor" textAnchor="middle">signed link</text>
                  <line x1={s.x + 100} y1="126" x2={s.x + 100} y2="150" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
                </g>
              ))}
              <line x1="220" y1="98" x2="260" y2="98" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" markerEnd="url(#ar)" />
              <line x1="460" y1="98" x2="500" y2="98" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" markerEnd="url(#ar)" />
              <defs>
                <marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" fillOpacity="0.6" />
                </marker>
              </defs>
            </svg>
          </div>
          <p className="text-xs muted">
            The layout is the contract; each link is evidence a step honored it. Verification fails
            if a step is missing, signed by the wrong key, or if an artifact&apos;s hash does not
            carry forward.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The in-toto Attestation Framework</h2>
          <p className="text-sm muted">
            Early in-toto focused on links and layouts. The project later generalized the idea into
            the <strong>in-toto Attestation Framework</strong>, a standard format for making any
            signed claim about an artifact. An attestation has two parts: a <em>subject</em> that
            names artifacts by digest, and a <em>predicate</em> that carries the actual claim.
          </p>
          <p className="text-sm muted">
            The predicate is where the ecosystem converged. SLSA build provenance is an in-toto
            predicate. An SBOM can be one. So can test results or a vulnerability report. Because the
            envelope and subject are standardized, a tool that signs an attestation and a tool that
            verifies it do not need to agree on anything except the format. This is why in-toto shows
            up under the hood of{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Sigstore and Cosign
            </Link>{" "}
            and inside many CI provenance features.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">in-toto and SLSA</h2>
          <p className="text-sm muted">
            The two are frequently mentioned together and often confused.{" "}
            <Link href="/blog/slsa-framework-explained" className="underline">
              SLSA
            </Link>{" "}
            is a graded set of requirements: it tells you what integrity guarantees a build should
            provide at each level, such as producing tamper-resistant provenance. in-toto is a
            mechanism that satisfies those requirements &mdash; SLSA provenance is literally encoded
            as an in-toto attestation. Think of SLSA as the specification and in-toto as one of the
            reference implementations that makes it real. You do not choose between them; you use
            in-toto to meet SLSA.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Tooling and adoption</h2>
          <p className="text-sm muted">
            The reference implementation is a Python toolchain (<code>in-toto-run</code> to wrap a
            step and emit a link, <code>in-toto-verify</code> to check a final product against a
            layout). There is a Go implementation, and the Witness project plus its Archivista store
            popularized attestation collection in cloud-native pipelines. On the consuming side,
            policy engines and admission controllers can require valid attestations before an image
            is allowed to deploy. If you already gate deploys with{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              SBOMs
            </Link>{" "}
            and signatures, adding in-toto attestations is an incremental step, not a rewrite.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where scanning fits</h2>
          <p className="text-sm muted">
            in-toto answers a question about <em>process</em>: was this artifact built by the right
            parties, through the expected steps, without tampering? It deliberately says nothing
            about a different question: does the artifact contain components with known
            vulnerabilities? A perfectly attested build can still ship an image full of outdated,
            CVE-ridden libraries, because the flaws were in the dependencies all along.
          </p>
          <p className="text-sm muted">
            That is where ScanRook fits. We scan the finished artifact &mdash; the container image,
            source tarball, or binary &mdash; matching its packages against OSV, NVD, and Red Hat
            OVAL to produce ranked findings and a full SBOM. Those results are exactly the kind of
            claim the in-toto Attestation Framework was designed to carry: a scan report becomes a
            predicate, signed and bound to the artifact&apos;s digest. Provenance proves the chain;
            scanning proves the contents. A mature supply-chain program wants both.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is in-toto?</h3>
              <p className="text-sm muted mt-1">
                An open-source framework, born at NYU&apos;s Secure Systems Lab and now a CNCF
                project, that secures a supply chain by signing every build step and verifying the
                finished artifact against a signed policy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does in-toto work?</h3>
              <p className="text-sm muted mt-1">
                A signed layout defines the steps and who may run them. Each step emits signed link
                metadata with input and output hashes. A verifier confirms every step was authorized
                and artifacts flowed correctly end to end.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is in-toto the same as SLSA?</h3>
              <p className="text-sm muted mt-1">
                No. SLSA is a set of build-integrity requirements; in-toto is a framework that meets
                them. SLSA provenance is expressed as an in-toto attestation, so they are used
                together.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does in-toto replace a vulnerability scanner?</h3>
              <p className="text-sm muted mt-1">
                No. in-toto verifies how an artifact was built, not what is inside it. You still need
                a scanner to find known CVEs in the packages, and those results can ride along as an
                in-toto attestation.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Prove the chain, then check the contents</h3>
          <p className="text-sm muted leading-relaxed">
            in-toto verifies how your artifact was built. ScanRook tells you what is inside it &mdash;
            scanning every image, source tree, and binary against OSV, NVD, and vendor advisory data,
            with a full SBOM you can attach to your attestations.
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
            <Link href="/blog/slsa-framework-explained" className="underline">
              The SLSA Framework Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Image Signing with Sigstore and Cosign
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

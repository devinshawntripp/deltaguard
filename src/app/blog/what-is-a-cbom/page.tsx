import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-25";

const title = `What Is a CBOM? Cryptography Bill of Materials Explained | ${APP_NAME}`;
const description =
  "A CBOM (Cryptography Bill of Materials) inventories the algorithms, certificates, keys, and libraries in your software, and why PQC migration needs one.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "what is a cbom",
    "cryptography bill of materials",
    "cbom vs sbom",
    "cyclonedx cbom",
    "post-quantum cryptography inventory",
    "pqc migration inventory",
    "cbom explained",
    "cryptographic asset inventory",
    "cryptographic bill of materials",
    "harvest now decrypt later",
  ],
  alternates: { canonical: "/blog/what-is-a-cbom" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/what-is-a-cbom",
    images: ["/blog/what-is-a-cbom.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/what-is-a-cbom.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "What Is a CBOM? Cryptography Bill of Materials Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/what-is-a-cbom",
  image: "https://scanrook.io/blog/what-is-a-cbom.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a CBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A CBOM, or Cryptography Bill of Materials, is a structured inventory of the cryptographic assets used in a piece of software or a system: the algorithms and their parameters, certificates, keys and where they live, protocol versions, and the crypto libraries that implement all of it. It is standardized as a native asset type in CycloneDX 1.6, building on cryptographic-asset inventory work originally proposed by IBM.",
      },
    },
    {
      "@type": "Question",
      name: "How is a CBOM different from an SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An SBOM (Software Bill of Materials) lists the components in your software — packages, versions, licenses. A CBOM lists the cryptography those components use or implement — algorithms, key sizes, certificates, TLS versions, crypto libraries. The two are complementary rather than competing: both are CycloneDX document types, and a mature software supply chain program eventually wants both.",
      },
    },
    {
      "@type": "Question",
      name: "Why is CBOM suddenly a topic now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Post-quantum cryptography migration. NIST finalized its first PQC standards in August 2024, and government guidance now directs agencies to inventory their cryptography before they can plan a migration away from algorithms a quantum computer could eventually break. You cannot migrate cryptography you have not first found, and a CBOM is the artifact that records what you found.",
      },
    },
    {
      "@type": "Question",
      name: "What is 'harvest now, decrypt later'?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is the threat model driving urgency around PQC migration: an adversary captures encrypted traffic or data today, while it is still protected by classical algorithms like RSA or ECC, and stores it. If a sufficiently capable quantum computer arrives later, that stored data can be decrypted retroactively — so data with a long confidentiality lifetime is at risk even before quantum computers are practical.",
      },
    },
    {
      "@type": "Question",
      name: "Does ScanRook generate a CBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. As of scanner v1.18.0, ScanRook generates a CycloneDX 1.6 CBOM on any image scan with the --cbom flag: crypto libraries (with CVE cross-references), certificates (subject, expiry, signature algorithm, key size, plus expired/weak/SHA-1 flags), private-key material baked into the image, and heuristic TLS/SSH protocol hints. Scanning nginx:1.27, for example, surfaces 4 crypto libraries and 280 certificates (8 expired, 60 using weak keys) in its CA bundle. The CBOM appears as its own tab in the scan report.",
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
            What Is a CBOM? Cryptography Bill of Materials Explained
          </h1>
          <p className="text-sm muted">Published August 25, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            If you have spent any time on SBOMs, a CBOM will look familiar and different at once.
            So what is a CBOM? It is the same idea &mdash; a structured, machine-readable inventory
            &mdash; pointed at a different target: not your software components, but the
            cryptography those components use. Here is what goes in one, why post-quantum migration
            made it suddenly relevant, and where scanning fits today.
          </p>
        </header>

        <img
          src="/blog/what-is-a-cbom.jpg"
          alt="What is a CBOM: cryptography bill of materials explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What a CBOM actually is</h2>
          <p className="text-sm muted">
            A CBOM &mdash; Cryptography Bill of Materials &mdash; is an inventory of the
            cryptographic assets present in a piece of software or a system. That includes the
            algorithms in use and their parameters (key sizes, elliptic curves), the certificates
            issued and consumed, the keys and secrets and where they are stored or referenced, the
            protocol versions negotiated (TLS 1.2 versus 1.3, for example), and the cryptographic
            libraries that implement all of it, down to the version installed.
          </p>
          <p className="text-sm muted">
            The idea is not new, but the standardization is recent. Cryptographic-asset inventory
            work originally proposed by IBM was contributed into{" "}
            <Link href="/blog/cyclonedx-vs-spdx" className="underline">
              CycloneDX
            </Link>
            , the SBOM standard maintained by OWASP, and landed as a native asset type in CycloneDX
            1.6. That matters because it means a CBOM is not a bespoke, one-off spreadsheet format
            &mdash; it is a documented schema that tooling can generate, validate, and exchange the
            same way SBOM tooling already does for software components.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why a CBOM exists now: the post-quantum migration
          </h2>
          <p className="text-sm muted">
            CBOMs existed as a concept before 2024, but post-quantum cryptography (PQC) migration
            is what turned them from a niche idea into something procurement teams and security
            programs are asking about. In August 2024, NIST finalized its first three post-quantum
            cryptography standards: ML-KEM (FIPS 203, key encapsulation), ML-DSA (FIPS 204, digital
            signatures), and SLH-DSA (FIPS 205, a stateless hash-based signature scheme). For the
            first time, organizations have finished, published algorithms to migrate <em>to</em>
            &mdash; which makes the question of what to migrate <em>from</em> concrete rather than
            theoretical.
          </p>
          <p className="text-sm muted">
            Government guidance is pushing in the same direction. The NSA&apos;s CNSA 2.0 suite lays
            out a timeline for national security systems to adopt quantum-resistant algorithms, with
            a full transition target in the early 2030s. On the civilian side, National Security
            Memorandum 10 and follow-on OMB guidance direct federal agencies to inventory the
            cryptography in their systems as a first, concrete step &mdash; before any migration
            planning can start. You cannot replace algorithms you have not located.
          </p>
          <p className="text-sm muted">
            The urgency has a name: &ldquo;harvest now, decrypt later.&rdquo; An adversary who
            captures encrypted traffic or data today, while it is protected by classical algorithms
            like RSA or elliptic-curve cryptography, can simply store it. If a cryptographically
            relevant quantum computer arrives in the future, that stored data becomes readable
            retroactively. For anything with a long confidentiality lifetime &mdash; health records,
            trade secrets, long-lived credentials &mdash; that risk exists now, well before quantum
            computers are practical, which is exactly why inventory work is starting early.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">CBOM vs SBOM</h2>
          <p className="text-sm muted">
            An{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              SBOM
            </Link>{" "}
            answers &ldquo;what components make up this software, and which versions?&rdquo; A CBOM
            answers a narrower, adjacent question: &ldquo;what cryptography does this software use,
            and is any of it weak, expiring, or quantum-vulnerable?&rdquo; A package can appear in
            both: an SBOM entry for OpenSSL 3.0.x tells you the library and version is present; a
            CBOM entry tells you which algorithms and key sizes that library is actually configured
            to use at runtime.
          </p>
          <p className="text-sm muted">
            The two are complementary, not competing, and both live under the same CycloneDX
            umbrella &mdash; the format comparison in our{" "}
            <Link href="/blog/cyclonedx-vs-spdx" className="underline">
              CycloneDX vs SPDX
            </Link>{" "}
            post applies to CBOMs the same way it applies to SBOMs. A security program that already
            generates SBOMs is well positioned to add CBOM generation later, since much of the
            underlying discovery work &mdash; parsing installed packages, resolving versions &mdash;
            overlaps.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What goes into a CBOM</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Algorithms and parameters</strong> &mdash; which ciphers, hash functions, and
              signature schemes are in use, plus their parameters: RSA key size, elliptic curve
              (P-256, P-384), symmetric key length (AES-128 vs AES-256).
            </li>
            <li>
              <strong>Certificates</strong> &mdash; issuer, subject, expiry date, and signature
              algorithm, so an expiring certificate or one signed with a deprecated algorithm shows
              up in the same inventory as everything else.
            </li>
            <li>
              <strong>Keys and secrets locations</strong> &mdash; where private keys and credential
              material live or are referenced (a secrets manager, a mounted file, an HSM), not the
              key material itself.
            </li>
            <li>
              <strong>Protocol versions</strong> &mdash; negotiated TLS versions and cipher suites
              across services, which is often where legacy, weak configuration hides longest.
            </li>
            <li>
              <strong>Crypto libraries and their CVE exposure</strong> &mdash; OpenSSL, BoringSSL,
              libsodium, and similar libraries, tied to their installed version so known
              vulnerabilities in the crypto implementation itself are visible, not just in the
              algorithms it offers.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical checklist for getting started</h2>
          <p className="text-sm muted">
            A full CycloneDX CBOM is the end state, but the discovery work behind it can start today
            with tooling most teams already run:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Inventory the crypto libraries (OpenSSL, BoringSSL, libsodium, and similar) present in your container images, along with their exact versions.</li>
            <li>Find certificates baked into images at build time rather than mounted or issued at runtime &mdash; they are easy to forget and easy to let expire.</li>
            <li>Map the TLS configuration each service actually negotiates, not just what its config file claims it allows.</li>
            <li>Track OpenSSL (and equivalent) versions across the whole fleet, since crypto library CVEs tend to be severe and widely deployed.</li>
            <li>Flag anything using RSA, classic elliptic-curve, or classic Diffie-Hellman key exchange as a candidate for the PQC migration conversation, without treating it as an emergency to rip out today.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where scanning fits today</h2>
          <p className="text-sm muted">
            ScanRook generates a CBOM directly from an image scan. As of scanner v1.18.0, passing
            <code className="mx-1 rounded bg-black/10 px-1 dark:bg-white/10">--cbom</code> emits a
            CycloneDX 1.6 cryptographic-asset inventory alongside the normal findings: the crypto
            libraries present (OpenSSL, GnuTLS, libgcrypt, and similar) matched against known CVEs,
            every certificate discovered in the image with its subject, expiry, signature algorithm
            and key size, any private-key material baked into the image (raised as a high-severity
            finding), and heuristic TLS and SSH protocol settings pulled from common config files.
          </p>
          <p className="text-sm muted">
            To make that concrete: scanning the stock <code className="mx-1 rounded bg-black/10 px-1 dark:bg-white/10">nginx:1.27</code>
            image surfaces four crypto libraries &mdash; including OpenSSL 3.0.16 and GnuTLS 3.7.9,
            each carrying dozens of known CVEs &mdash; and 280 certificates in its CA bundle, of which
            eight are already expired and sixty use weak keys. Certificates flagged as expired,
            SHA-1-signed, or below modern key-size thresholds are exactly the inventory a PQC
            migration starts from. The results render in a dedicated CBOM tab in the scan report, and
            <code className="mx-1 rounded bg-black/10 px-1 dark:bg-white/10">--cbom-out</code> writes a
            standalone CycloneDX 1.6 document you can feed to other tooling. If your
            organization is under a mandate to inventory cryptography &mdash; see our overview of{" "}
            <Link href="/blog/sbom-requirements-2026" className="underline">
              SBOM requirements in 2026
            </Link>{" "}
            for the broader regulatory backdrop &mdash; consult counsel on what your specific
            compliance obligations require, since the details vary by sector and jurisdiction. Our{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover what today&apos;s scans surface in the meantime.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is a CBOM?</h3>
              <p className="text-sm muted mt-1">
                A structured inventory of cryptographic assets &mdash; algorithms, keys,
                certificates, protocols, and crypto libraries &mdash; standardized as a native asset
                type in CycloneDX 1.6.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is a CBOM different from an SBOM?</h3>
              <p className="text-sm muted mt-1">
                An SBOM lists software components; a CBOM lists the cryptography those components
                use. They are complementary CycloneDX document types, not substitutes for each
                other.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is CBOM suddenly a topic now?</h3>
              <p className="text-sm muted mt-1">
                Post-quantum migration. NIST finalized its first PQC standards in August 2024, and
                government guidance now directs agencies to inventory cryptography before they can
                plan a migration.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is &ldquo;harvest now, decrypt later&rdquo;?</h3>
              <p className="text-sm muted mt-1">
                The risk that encrypted data captured today gets decrypted retroactively once
                quantum computers are capable enough &mdash; which is why long-lived sensitive data
                is a migration priority.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does ScanRook generate a CBOM?</h3>
              <p className="text-sm muted mt-1">
                Not a complete one yet. ScanRook already identifies crypto libraries like OpenSSL
                and their CVEs during scans; full structured CBOM output is a roadmap direction, not
                a shipped feature.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See what crypto is already in your images</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook identifies crypto libraries like OpenSSL and their known CVEs as part of every
            scan &mdash; a practical starting point for crypto visibility while you plan for a
            full cryptographic inventory.
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
            <Link href="/blog/cyclonedx-vs-spdx" className="underline">
              CycloneDX vs SPDX
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sbom-requirements-2026" className="underline">
              SBOM Requirements in 2026
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

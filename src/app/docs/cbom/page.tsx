import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CBOM: Cryptography Bill of Materials | ScanRook Docs",
  description:
    "How ScanRook generates a CycloneDX 1.6 Cryptography Bill of Materials from container images: crypto libraries, certificates, private keys, and protocol hints for PQC readiness.",
  keywords: [
    "CBOM",
    "cryptography bill of materials",
    "CycloneDX 1.6",
    "cryptoProperties",
    "post-quantum readiness",
    "PQC migration",
    "certificate inventory",
    "private key detection",
    "crypto asset discovery",
  ],
  alternates: {
    canonical: "/docs/cbom",
  },
  openGraph: {
    title: "CBOM: Cryptography Bill of Materials | ScanRook Docs",
    description:
      "How ScanRook generates a CycloneDX 1.6 Cryptography Bill of Materials from container images: crypto libraries, certificates, private keys, and protocol hints.",
    type: "article",
    url: "/docs/cbom",
  },
  twitter: {
    card: "summary_large_image",
    title: "CBOM: Cryptography Bill of Materials | ScanRook Docs",
    description:
      "How ScanRook generates a CycloneDX 1.6 Cryptography Bill of Materials from container images: crypto libraries, certificates, private keys, and protocol hints.",
  },
};

export default function CbomPage() {
  return (
    <article className="grid gap-6">
      {/* Intro */}
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          CBOM: Cryptography Bill of Materials
        </h1>
        <p className="muted text-sm max-w-3xl">
          A CBOM inventories every cryptographic asset in your software: the
          crypto libraries you link against, the certificates baked into your
          images, the private keys that should never have shipped, and the
          protocol versions your services negotiate. ScanRook generates a
          CycloneDX 1.6 CBOM alongside its SBOM during container scans — no
          extra tooling, no separate pass.
        </p>
      </section>

      {/* Why a CBOM */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Why You Need a CBOM"
          blurb="Post-quantum migration and crypto policy enforcement both start with an inventory."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            You cannot migrate cryptography you do not know you have. NIST has
            finalized post-quantum algorithms, and regulators are already asking
            organizations to produce migration timelines. The first deliverable
            in every one of those timelines is the same: a complete inventory of
            cryptographic assets. That is a CBOM.
          </p>
          <p>
            Beyond quantum readiness, a CBOM answers day-to-day security
            questions: Is anything in production still signed with SHA-1? Did an
            expired certificate ship inside that image? Is there an RSA-1024 key
            pair in a config directory? Did a developer accidentally bake a
            private key into a layer? These issues hide inside images that pass
            every vulnerability scan, because they are not CVEs — they are
            cryptographic hygiene failures.
          </p>
          <p>
            ScanRook emits its CBOM in CycloneDX 1.6 format using the standard{" "}
            <code className="text-xs bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">cryptographic-asset</code>{" "}
            component type with{" "}
            <code className="text-xs bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">cryptoProperties</code>,
            so it plugs into any toolchain that already consumes CycloneDX.
          </p>
        </div>
      </section>

      {/* What ScanRook collects */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="What ScanRook Collects"
          blurb="Four collectors run over the extracted image filesystem and package inventory."
        />
        <div className="grid gap-3">
          <CollectorCard
            name="Crypto libraries"
            detail="The package inventory and ELF dynamic dependencies are classified against a curated list of cryptographic libraries (OpenSSL, BoringSSL, GnuTLS, libsodium, mbedTLS, wolfSSL, libgcrypt, NSS, Bouncy Castle, pyca/cryptography, golang.org/x/crypto, ring, rustls, and more). Each match includes the version and any CVE findings from the same scan."
          />
          <CollectorCard
            name="Certificates"
            detail="The extracted filesystem is walked for .pem, .crt, .cer, .der, .p12, and .pfx files plus PEM CERTIFICATE blocks in config directories. Each certificate is parsed for subject, issuer, expiry, signature algorithm, and key algorithm/size, then flagged for weaknesses."
          />
          <CollectorCard
            name="Private keys"
            detail="PEM private key blocks (RSA, EC, PKCS#8, OpenSSH) found in the image are reported as CBOM entries AND raised as HIGH severity findings — private key material should never ship inside an image. Encrypted PKCS#12 containers are noted without any cracking attempt."
          />
          <CollectorCard
            name="Protocol hints"
            detail="Known configuration files (nginx ssl_protocols, openssl.cnf MinProtocol, sshd_config) are parsed for TLS/SSH protocol versions where trivially extractable. These are best-effort and always marked with confidence: heuristic."
          />
        </div>
      </section>

      {/* Weakness flags */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Weakness Flags"
          blurb="Certificates are automatically flagged for common cryptographic weaknesses."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="text-left py-2 px-2 font-medium muted">Flag</th>
                <th className="text-left py-2 px-2 font-medium muted">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <FlagRow flag="expired" meaning="Certificate notAfter date is in the past." />
              <FlagRow flag="expires-soon" meaning="Certificate expires within 90 days." />
              <FlagRow flag="sha1-signature" meaning="Certificate is signed with SHA-1, which is broken for collision resistance." />
              <FlagRow flag="weak-rsa" meaning="RSA key is shorter than 2048 bits." />
              <FlagRow flag="weak-ec" meaning="Elliptic curve key uses a curve weaker than 256 bits." />
            </tbody>
          </table>
        </div>
      </section>

      {/* How to enable */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Generating a CBOM"
          blurb="Pass --cbom to any container or auto-detect scan. Requires scanner 1.18 or newer."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            CBOM generation is available on <strong>all plan tiers</strong>. Add
            the flag to your scan command:
          </p>
          <pre className="text-xs bg-black/5 dark:bg-white/10 rounded-md p-3 overflow-x-auto"><code>{`# CBOM section embedded in the scan report
scanrook scan image.tar --cbom

# Additionally write a standalone CycloneDX 1.6 CBOM file
scanrook scan image.tar --cbom --cbom-out cbom.cdx.json`}</code></pre>
          <p>
            The report JSON gains a top-level{" "}
            <code className="text-xs bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">cbom</code>{" "}
            section with the collected assets and a summary block (crypto
            library count, certificate count, expired/weak certificates,
            private keys). The optional{" "}
            <code className="text-xs bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">--cbom-out</code>{" "}
            file is pure CycloneDX 1.6 JSON, suitable for handing to compliance
            tooling.
          </p>
        </div>
      </section>

      {/* Dashboard */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Viewing CBOMs in the Dashboard"
          blurb="Every scan detail page has a CBOM tab next to the SBOM tab."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            When a scan completes with CBOM enabled, the job detail page in the{" "}
            <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">dashboard</Link>{" "}
            shows a <strong>CBOM</strong> tab with summary cards (crypto
            libraries, certificates, expired, weak, private keys), a
            color-coded certificate table, a crypto library table with linked
            CVE counts, a private key list, and collapsed protocol hints.
          </p>
          <p>
            Scans produced by scanner versions older than 1.18, or run without{" "}
            <code className="text-xs bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">--cbom</code>,
            show an empty state in the tab — everything else about the scan is
            unaffected.
          </p>
        </div>
      </section>

      {/* Related */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Related Reading"
          blurb="CBOM builds on the same pipeline as ScanRook's SBOM and findings features."
        />
        <ul className="text-sm grid gap-2">
          <li>
            <Link href="/docs/concepts/supply-chain-security" className="text-blue-600 dark:text-blue-400 hover:underline">
              Supply Chain Security
            </Link>
            <span className="muted"> — where CBOM fits in your artifact security posture.</span>
          </li>
          <li>
            <Link href="/docs/concepts/compliance" className="text-blue-600 dark:text-blue-400 hover:underline">
              Compliance
            </Link>
            <span className="muted"> — mapping scan outputs to frameworks.</span>
          </li>
          <li>
            <Link href="/docs/cli-reference" className="text-blue-600 dark:text-blue-400 hover:underline">
              CLI Reference
            </Link>
            <span className="muted"> — full flag documentation for the scanner CLI.</span>
          </li>
        </ul>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}

function CollectorCard({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="rounded-lg bg-black/5 dark:bg-white/5 p-4">
      <div className="text-sm font-semibold mb-1">{name}</div>
      <p className="text-sm muted">{detail}</p>
    </div>
  );
}

function FlagRow({ flag, meaning }: { flag: string; meaning: string }) {
  return (
    <tr className="border-b border-black/5 dark:border-white/5">
      <td className="py-1.5 px-2">
        <code className="text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">{flag}</code>
      </td>
      <td className="py-1.5 px-2 muted">{meaning}</td>
    </tr>
  );
}

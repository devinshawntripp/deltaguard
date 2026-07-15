import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-29";

const title = `Image Signing with Sigstore and Cosign, Explained | ${APP_NAME}`;
const description =
  "How container image signing works with Sigstore and Cosign: keyless signing, the transparency log, verifying signatures, and where it fits alongside scanning.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "image signing",
    "container image signing",
    "sigstore",
    "cosign",
    "sigstore cosign",
    "keyless signing",
    "cosign verify",
    "sign docker images",
    "container signing",
    "sigstore transparency log",
    "supply chain signing",
  ],
  alternates: { canonical: "/blog/sigstore-cosign-container-signing" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sigstore-cosign-container-signing",
    images: ["/blog/sigstore-cosign-container-signing.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sigstore-cosign-container-signing.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Image Signing with Sigstore and Cosign, Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sigstore-cosign-container-signing",
  image: "https://scanrook.io/blog/sigstore-cosign-container-signing.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does signing a container image prove?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A signature proves authenticity and integrity: that the image was signed by a specific identity and has not been altered since. It does not say anything about whether the image is free of vulnerabilities. A signed image can be perfectly authentic and still full of known CVEs, which is why signing and scanning are separate, complementary controls.",
      },
    },
    {
      "@type": "Question",
      name: "What is Sigstore?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sigstore is an open-source project for signing and verifying software artifacts. Its main pieces are Cosign (the signing CLI), Fulcio (a certificate authority that issues short-lived certificates bound to an OIDC identity), and Rekor (a public transparency log that records signing events). Together they enable signing without managing long-lived private keys.",
      },
    },
    {
      "@type": "Question",
      name: "What is keyless signing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Keyless signing uses your OIDC identity instead of a long-lived key. Cosign obtains an identity token, Fulcio issues a short-lived certificate bound to that identity, the artifact is signed with an ephemeral key, and the event is recorded in the Rekor transparency log. There is no private key to store or rotate, which removes a major operational risk.",
      },
    },
    {
      "@type": "Question",
      name: "How do you verify a signed image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You run cosign verify against the image. For key-based signatures you pass the public key; for keyless signatures you assert the expected certificate identity and OIDC issuer. In Kubernetes, admission controllers such as the Sigstore policy-controller or Kyverno can enforce verification automatically so unsigned or untrusted images never run.",
      },
    },
    {
      "@type": "Question",
      name: "Does signing replace vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Signing answers who built an image and whether it was tampered with; scanning answers whether its contents have known vulnerabilities. The two solve different problems. The strong pattern is to scan the artifact, then sign the exact digest you scanned, and attach the scan results as a signed attestation.",
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
            Image Signing with Sigstore and Cosign, Explained
          </h1>
          <p className="text-sm muted">Published August 29, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Image signing answers a question scanning cannot: <em>who</em> built this image, and has
            it been changed since? Sigstore and its CLI, Cosign, made signing practical by removing
            the part everyone hated &mdash; managing long-lived private keys. Here is how it works,
            with runnable commands, and an honest account of what a signature does and does not tell
            you.
          </p>
        </header>

        <img
          src="/blog/sigstore-cosign-container-signing.jpg"
          alt="Signing and verifying a container image with Sigstore and Cosign"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What signing does &mdash; and does not &mdash; prove</h2>
          <p className="text-sm muted">
            A signature binds two facts to an image: <strong>authenticity</strong> (a specific
            identity signed it) and <strong>integrity</strong> (its bytes have not changed since). If
            an attacker swaps an image in your registry, or a build tampers with it after signing,
            verification fails. That is genuinely valuable &mdash; it closes the &ldquo;is this the
            artifact we actually produced?&rdquo; gap that scanning leaves wide open.
          </p>
          <p className="text-sm muted">
            It is equally important to be clear about what a signature is silent on: the security of
            the contents. A perfectly signed image can be riddled with known CVEs. Signing proves
            provenance, not safety. This is why signing and{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              vulnerability scanning
            </Link>{" "}
            are complementary controls rather than substitutes &mdash; one tells you where the image
            came from, the other tells you what is inside it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The pieces of Sigstore</h2>
          <p className="text-sm muted">
            Sigstore is an open-source project (under the OpenSSF) with three parts that matter here:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Cosign</strong> &mdash; the command-line tool that signs and verifies container
              images and other OCI artifacts, storing signatures alongside the image in the registry.
            </li>
            <li>
              <strong>Fulcio</strong> &mdash; a certificate authority that issues short-lived (roughly
              ten-minute) certificates bound to an OIDC identity, so you can sign without a permanent
              key.
            </li>
            <li>
              <strong>Rekor</strong> &mdash; a public, append-only transparency log that records
              signing events, so a signature can be verified later and its existence audited.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Key-based signing</h2>
          <p className="text-sm muted">
            The simplest model uses a key pair you generate and hold. It is easy to reason about and
            works offline, at the cost of having a private key to protect and rotate.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Generate a key pair (writes cosign.key and cosign.pub)
cosign generate-key-pair

# Always sign by digest, never by a mutable tag
IMG=registry.example.com/app@sha256:<digest>

# Sign the image with your private key
cosign sign --key cosign.key "$IMG"

# Anyone with the public key can verify it
cosign verify --key cosign.pub "$IMG"`}</pre>
          <p className="text-sm muted">
            Sign the <em>digest</em>, not a tag. Tags are mutable &mdash;{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">app:latest</code>{" "}
            can point at a different image tomorrow &mdash; so signing a tag signs a moving target.
            Cosign stores the signature as an OCI artifact in the same registry, derived from the
            image digest, so it travels with the image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Keyless signing</h2>
          <p className="text-sm muted">
            Keyless signing is the model most teams adopt, because it removes the private key
            entirely. In Cosign v2 it is the default: run{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cosign sign</code>{" "}
            without a key and it performs an OIDC flow, Fulcio issues a short-lived certificate bound
            to your identity, Cosign signs with an ephemeral key, and the event is recorded in Rekor.
            Nothing long-lived is left on disk to steal.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Keyless: triggers an OIDC identity flow, no key file needed
cosign sign "$IMG"

# Verify, asserting exactly which identity is allowed to have signed
cosign verify \\
  --certificate-identity="https://github.com/acme/app/.github/workflows/release.yml@refs/heads/main" \\
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \\
  "$IMG"`}</pre>
          <p className="text-sm muted">
            The verification step is where the security lives. You are not just checking that
            <em> some</em> valid signature exists &mdash; you assert <em>which</em> identity and{" "}
            <em>which</em> OIDC issuer are acceptable. In CI, the identity is the workflow&apos;s
            workload identity (for example, a GitHub Actions OIDC token), so &ldquo;signed by our
            release pipeline&rdquo; becomes something you can express and enforce precisely.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Attestations: signing more than the image</h2>
          <p className="text-sm muted">
            Cosign can also sign <em>attestations</em> &mdash; signed statements about an image, such
            as its SBOM or its build provenance. Instead of just &ldquo;this image is authentic,&rdquo;
            an attestation says &ldquo;here is the SBOM for this image, and it is signed by the same
            trusted identity.&rdquo; That ties your inventory to the artifact cryptographically.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Attach a signed SBOM attestation (CycloneDX predicate) to the image
cosign attest --predicate sbom.cdx.json --type cyclonedx "$IMG"

# Verify the attestation and its predicate type
cosign verify-attestation --type cyclonedx \\
  --certificate-identity="..." \\
  --certificate-oidc-issuer="..." \\
  "$IMG"`}</pre>
          <p className="text-sm muted">
            This is the bridge to the broader{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain
            </Link>{" "}
            picture: a signed SBOM attestation lets a downstream consumer verify both that the image
            is authentic and that the component inventory it is relying on genuinely describes that
            image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Enforcing signatures at deploy time</h2>
          <p className="text-sm muted">
            Signing is only useful if something checks the signature before an image runs. In
            Kubernetes, admission controllers do this: the Sigstore{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">policy-controller</code>{" "}
            or Kyverno&apos;s image-verification rules reject any pod whose image is unsigned or
            signed by an identity you have not allow-listed. The policy names the acceptable
            identities and issuers, and the cluster enforces it on every deploy &mdash; the same
            place a scanning gate can live, so authenticity and known-vulnerability checks run
            side by side.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not sign images &mdash; that is Cosign&apos;s job, and we would not pretend
            otherwise. Where ScanRook fits is the step right before signing: it scans the built
            container image, enumerates the OS packages and language dependencies actually present,
            and cross-references them against OSV, NVD, and Red Hat OVAL, producing both a findings
            report and an SBOM. The clean pattern is to scan the artifact, sign the exact digest you
            scanned, and attach the ScanRook SBOM as a signed{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cosign attest</code>{" "}
            predicate &mdash; so the thing you vouch for cryptographically is the same thing you
            verified is clean.
          </p>
          <p className="text-sm muted">
            Put plainly: a signature says &ldquo;this is the image we built.&rdquo; A scan says
            &ldquo;and here is what is inside it.&rdquo; You want both, on the same digest. The{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container image security checklist
            </Link>{" "}
            and our guide to{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              how ScanRook uses SBOMs
            </Link>{" "}
            show how the scanning and attestation steps line up in one pipeline.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does signing prove?</h3>
              <p className="text-sm muted mt-1">
                Authenticity and integrity &mdash; that a specific identity signed the image and it
                has not changed since. It says nothing about whether the image contains known
                vulnerabilities.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is Sigstore?</h3>
              <p className="text-sm muted mt-1">
                An open-source signing project: Cosign (CLI), Fulcio (short-lived certificate
                authority), and Rekor (transparency log), which together enable signing without
                long-lived keys.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is keyless signing?</h3>
              <p className="text-sm muted mt-1">
                Signing with your OIDC identity instead of a stored key: Fulcio issues a short-lived
                certificate, an ephemeral key signs the artifact, and Rekor records the event.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does signing replace scanning?</h3>
              <p className="text-sm muted mt-1">
                No. Signing proves origin and integrity; scanning finds known vulnerabilities. Scan
                the artifact, then sign the digest you scanned, and attach the results as an
                attestation.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan before you sign</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook scans the exact image you are about to sign, produces an SBOM you can attach as a
            signed attestation, and cross-checks every component against OSV, NVD, and OVAL. Sign what
            you verified is clean.
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
              Container Image Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Vulnerability Scanning for Compliance
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

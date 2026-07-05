import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-23";

const title = `How to Handle Unfixable CVEs With No Fix Available | ${APP_NAME}`;
const description =
  "A practical process for unfixable CVEs with no fix available: verify reachability, check EPSS and KEV, apply mitigations, and document the decision.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "unfixable cves no fix available",
    "cve no fix available",
    "vulnerability with no patch",
    "risk acceptance cve",
    "compensating controls vulnerability",
    "epss no fix",
    "cisa kev no fix",
    "vulnerability triage no patch",
    "mitigate unpatched cve",
    "handle unpatchable vulnerability",
  ],
  alternates: { canonical: "/blog/how-to-handle-unfixable-cves" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/how-to-handle-unfixable-cves",
    images: ["/blog/how-to-handle-unfixable-cves.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/how-to-handle-unfixable-cves.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Handle Unfixable CVEs With No Fix Available",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/how-to-handle-unfixable-cves",
  image: "https://scanrook.io/blog/how-to-handle-unfixable-cves.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does it mean when a CVE has no fix available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It means no vendor or maintainer patch exists yet for the affected package version, either because the fix has not been released, the distribution has stopped backporting fixes to that release, or the project is unmaintained. It does not mean the finding should be ignored — it means the response shifts from patching to risk management.",
      },
    },
    {
      "@type": "Question",
      name: "How do I check if a CVE with no fix is actually exploitable in my environment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Check whether the affected code path is reachable: is the vulnerable function actually called by your application, is the package loaded at runtime, and is the attack vector exposed to untrusted input. A finding in a library loaded but never invoked carries far less real risk than one on a network-facing entry point.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use EPSS or CISA KEV to prioritize unfixable CVEs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both, for different signals. EPSS estimates the probability of exploitation in the next 30 days from a model; CISA KEV lists vulnerabilities with confirmed real-world exploitation. A finding with no fix, high EPSS, and a KEV listing needs an immediate compensating control regardless of severity score.",
      },
    },
    {
      "@type": "Question",
      name: "What compensating controls work for an unpatched vulnerability?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Network segmentation or a WAF rule blocking the specific attack pattern, dropping Linux capabilities the vulnerable code needs to exploit, restricting the container to a read-only filesystem, or disabling the vulnerable feature entirely if your application does not need it.",
      },
    },
    {
      "@type": "Question",
      name: "How long should a risk acceptance for an unfixable CVE last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Set an explicit review date, typically 30 to 90 days depending on severity, rather than leaving it open-ended. Re-check at that date whether a fix has shipped, whether EPSS or KEV status changed, and whether removing the package has become feasible.",
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
            How to Handle Unfixable CVEs With No Fix Available
          </h1>
          <p className="text-sm muted">Published July 23, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Every scan report eventually has a row where the fixed-in column is empty. Unfixable
            CVEs with no fix available cannot be closed by patching, so the process has to shift to
            verification, mitigation, and a documented decision &mdash; here is a concrete process
            for doing that instead of leaving the finding open indefinitely.
          </p>
        </header>

        <img
          src="/blog/how-to-handle-unfixable-cves.jpg"
          alt="Handling unfixable CVEs with no fix available"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why some CVEs never get a fix</h2>
          <p className="text-sm muted">
            A finding can lack a fix for several distinct reasons, and the reason changes what you
            should do next: the maintainer has not released a patch yet, the distribution has
            reached end-of-life for that package version and stopped backporting security fixes, the
            project is abandoned entirely, or the fix requires a breaking change the maintainer is
            deliberately deferring. Treat &ldquo;no fix available&rdquo; as a category, not a single
            case.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Confirm the finding is genuinely unfixable</h2>
          <p className="text-sm muted">
            Before treating a finding as unfixable, rule out the common false negative: a fix exists
            in a newer major version that your scan is not aware you could adopt. List the affected
            package and version from your report and cross-check it against the package&apos;s
            release history:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# List findings with their package, version, and CVE
jq -r '.findings[] | "\\(.severity)\\t\\(.package.name)\\t\\(.package.version)\\t\\(.cve)"' report.json

# Cross-check the package's own release feed for anything newer
npm view <package> versions --json | tail -5
pip index versions <package>`}</pre>
          <p className="text-sm muted">
            If a newer version exists but your scanner reports no fix, the version may be too new to
            be indexed in the advisory database yet, or the upgrade may cross a major version
            boundary that your scanner does not treat as an automatic fix path. Read the changelog
            directly before concluding there is truly no fix.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Check whether the finding is actually reachable</h2>
          <p className="text-sm muted">
            An unfixable finding in a package your application never calls carries very different
            risk than one on a code path handling untrusted input. Confirm the package is loaded and
            trace whether your code invokes the vulnerable function:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Node: confirm the package is actually required at runtime, not just present
node -e "console.log(require.resolve('<package>'))"
grep -rn "require(['\\"]<package>" src/ || echo "no direct import found"

# Search for calls to the specific vulnerable function named in the advisory
grep -rn "<vulnerable_function_name>" src/ node_modules/<package>/`}</pre>
          <p className="text-sm muted">
            A transitive dependency that is installed but never imported by your code, or a function
            in the package that your application never calls, meaningfully lowers real-world risk
            even while the finding stays technically open. This is exactly the distinction our piece
            on{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning
            </Link>{" "}
            is built around.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Prioritize using EPSS and CISA KEV</h2>
          <p className="text-sm muted">
            Severity alone does not tell you urgency. Pull the exploit-probability and
            known-exploited status for each unfixable finding before deciding what needs a
            compensating control today versus next quarter:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Pull the EPSS score for a given CVE ID
curl -s "https://api.first.org/data/v1/epss?cve=$CVE_ID" | jq '.data[0].epss'

# Check whether it is in the CISA Known Exploited Vulnerabilities catalog
curl -s https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json \\
  | jq --arg id "$CVE_ID" '.vulnerabilities[] | select(.cveID == $id)'`}</pre>
          <p className="text-sm muted">
            A no-fix finding with a high EPSS score or a KEV listing is not a candidate for a
            deferred review &mdash; it needs a compensating control now. Our guides to{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              EPSS prioritization
            </Link>{" "}
            and the{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV catalog
            </Link>{" "}
            cover both signals in depth.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Apply a compensating control</h2>
          <p className="text-sm muted">
            When patching is not an option, reduce the blast radius instead. Two examples: drop the
            Linux capabilities the vulnerable code path would need, and restrict network egress at
            the pod level:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Kubernetes: drop all capabilities and force a read-only root filesystem
securityContext:
  capabilities:
    drop: ["ALL"]
  readOnlyRootFilesystem: true
  runAsNonRoot: true

---
# NetworkPolicy: block egress from the affected workload except to what it needs
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: restrict-affected-service
spec:
  podSelector:
    matchLabels: { app: affected-service }
  policyTypes: ["Egress"]
  egress:
    - to:
        - podSelector: { matchLabels: { app: internal-db } }`}</pre>
          <p className="text-sm muted">
            Neither control fixes the underlying CVE, but both reduce what an attacker can do if the
            vulnerable code path is ever reached, which is the realistic goal when no patch exists.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Remove or replace the package if it is feasible</h2>
          <p className="text-sm muted">
            If the affected package is a small piece of functionality, removing it outright is often
            faster than waiting on an upstream fix that may never arrive:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Find what depends on the unfixable package before removing it
npm ls <package>

# Remove it and its lockfile entry once nothing else depends on it
npm uninstall <package>

# Or swap to a maintained alternative and update imports
npm uninstall <package> && npm install <alternative-package>`}</pre>
          <p className="text-sm muted">
            This is also the point at which switching base images matters: if the unfixable finding
            lives in an OS package you do not use, a{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              smaller or distroless base
            </Link>{" "}
            may remove the package from the image entirely rather than requiring an application-level
            change.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 6: Document the decision and set a review date</h2>
          <p className="text-sm muted">
            An unfixable finding that gets a compensating control but no paper trail turns into a
            silent risk nobody revisits. Record the decision alongside the finding, with an explicit
            re-check date:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`{
  "finding_id": "$CVE_ID",
  "package": "<package>",
  "status": "risk_accepted",
  "reason": "no_fix_available",
  "reachability": "not_directly_invoked",
  "compensating_control": "capabilities_dropped, egress_restricted",
  "accepted_by": "security-team",
  "review_date": "2026-10-21"
}`}</pre>
          <p className="text-sm muted">
            Keep these records next to your scan reports so re-scans can flag when a review date has
            passed, turning an easy-to-forget manual process into something your CI can nag you
            about.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook reports the fixed-in version for every finding when one exists, so unfixable
            findings are unambiguous rather than something you have to infer. Confidence tiers
            separate findings tied to packages verifiably installed from heuristic matches, which
            matters most for exactly this triage decision. See the{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            for exporting findings into a triage workflow.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does &ldquo;no fix available&rdquo; mean for a CVE?</h3>
              <p className="text-sm muted mt-1">
                No vendor patch exists yet, or the distribution has stopped backporting fixes for
                that release. It shifts the response from patching to risk management.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I check if an unfixable CVE is exploitable in my app?</h3>
              <p className="text-sm muted mt-1">
                Check whether the package is actually loaded and whether your code calls the affected
                function &mdash; unreachable code carries far less real-world risk.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I use EPSS or KEV to prioritize these findings?</h3>
              <p className="text-sm muted mt-1">
                Use both. A no-fix finding with high EPSS or a KEV listing needs a compensating
                control immediately, regardless of its severity score.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What compensating controls work without a patch?</h3>
              <p className="text-sm muted mt-1">
                Dropping Linux capabilities, restricting network egress, enforcing a read-only
                filesystem, or disabling the vulnerable feature if it is unused.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Triage no-fix findings with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            See the fixed-in version and confidence tier for every finding so unfixable CVEs are a
            documented decision, not a guess.
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
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              EPSS Vulnerability Prioritization
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs Advisory Matching
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

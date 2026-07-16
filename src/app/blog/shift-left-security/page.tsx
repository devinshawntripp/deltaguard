import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-25";

const title = `Shift Left Security: What It Means and How to Do It | ${APP_NAME}`;
const description =
  "Shift left security moves testing earlier in the SDLC. What it means, the practices and tools, the alert-fatigue trap, and why you still need runtime coverage.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "shift left security",
    "what is shift left security",
    "shift left testing security",
    "devsecops shift left",
    "shift left security tools",
    "shift left in ci cd",
    "secure sdlc",
    "shift left vs shift right",
    "shift left best practices",
    "shift security left",
  ],
  alternates: { canonical: "/blog/shift-left-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/shift-left-security",
    images: ["/blog/shift-left-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/shift-left-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Shift Left Security: What It Means and How to Do It",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/shift-left-security",
  image: "https://scanrook.io/blog/shift-left-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is shift left security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Shift left security means moving security testing earlier in the software development lifecycle, toward design and coding, rather than treating it as a final gate before release. In practice that is threat modeling at design, static analysis and dependency scanning while code is written, and vulnerability scanning in the build pipeline, so issues are caught while they are cheap to fix.",
      },
    },
    {
      "@type": "Question",
      name: "Why is shift left security cheaper?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A flaw found in design or code is fixed by the person who wrote it, with full context, before anything is built on top of it. The same flaw found in production requires an incident response, a hotfix, redeployment, and often coordination across teams. The exact cost multiplier is debated, but the direction is not: earlier is dramatically cheaper.",
      },
    },
    {
      "@type": "Question",
      name: "What tools support shift left security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Common tools include SAST for source code, SCA for open-source dependencies, secret scanners at commit time, IaC scanners for configuration, and container image scanners in CI. The unifying idea is automation that runs in the developer's workflow and the pipeline, giving fast feedback rather than a report weeks later.",
      },
    },
    {
      "@type": "Question",
      name: "Does shift left mean I can stop testing in production?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Shift left is not shift-only-left. Some issues only appear at runtime, and new advisories are published against code that already shipped. You still need runtime protection, DAST, and production monitoring. Shift left reduces how much reaches production, it does not eliminate the need to watch what did.",
      },
    },
    {
      "@type": "Question",
      name: "What is the biggest mistake teams make with shift left?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Overwhelming developers with noise. Turning on every scanner at maximum strictness produces thousands of findings, most of them not reachable or not exploitable, and developers quickly learn to ignore the whole thing. Effective shift left prioritizes ruthlessly, gates only on what matters, and tunes out the rest.",
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
            Shift Left Security: What It Means and How to Do It
          </h1>
          <p className="text-sm muted">Published November 25, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Shift left security is the practice of moving security checks earlier in the development
            lifecycle &mdash; from a gate at the end toward the design, coding, and build stages
            where problems are cheapest to fix. It is one of the most repeated phrases in DevSecOps
            and one of the most often misapplied. This guide covers what it actually means, the
            practices that make it real, and the trap that turns a good idea into ignored noise.
          </p>
        </header>

        <img
          src="/blog/shift-left-security.jpg"
          alt="Shift left security across the software development lifecycle"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What shift left security means</h2>
          <p className="text-sm muted">
            Picture the software lifecycle as a line running left to right: requirements and design,
            then coding, then build, test, and finally deploy and run in production. For a long time,
            security lived at the far right &mdash; a penetration test or a review right before
            release, or worse, an incident after it. Shift left means moving those checks toward the
            left of that line, so a vulnerability is caught while someone is still writing the code
            that contains it, not months later in a production alert.
          </p>
          <p className="text-sm muted">
            It is a direction, not a single tool. Threat modeling during design is shift left.
            Flagging a vulnerable dependency in the pull request is shift left. Scanning the
            container image in CI before it can be pushed is shift left. The common thread is
            feedback that reaches the developer while the context is fresh and the fix is small.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where the idea comes from</h2>
          <p className="text-sm muted">
            The phrase started in software testing, not security. The insight was that catching a
            defect in a diagram is cheaper than catching it in QA, which is cheaper than catching it
            from a customer. When DevOps compressed the gap between writing code and shipping it,
            security inherited the same logic: a release cadence measured in hours cannot survive a
            security process measured in weeks. Shift left security is what you get when you apply
            the testing insight to vulnerabilities and fold the checks into the pipeline that already
            runs on every commit. It is the security half of a broader{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              vulnerability management lifecycle
            </Link>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why earlier is cheaper</h2>
          <p className="text-sm muted">
            A flaw caught in design is a conversation. Caught in code review, it is a one-line change
            by the author who still has the whole feature in their head. Caught in the build, it is a
            failed check and a dependency bump. Caught in production, it is an incident: triage, a
            hotfix, an emergency deploy, a postmortem, and often a customer notification. The exact
            cost multiplier between those stages is debated &mdash; the widely cited figures come
            from older studies with real methodological caveats &mdash; but the shape is not in
            dispute, and anyone who has shipped software has lived it.
          </p>

          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 260" className="w-full h-auto" role="img" aria-label="Illustrative chart: the relative cost to fix a flaw rises the later in the lifecycle it is caught">
              <text x="10" y="22" fontSize="15" fontWeight="600" fill="currentColor">
                Relative cost to fix, by where it is caught
              </text>
              <text x="10" y="40" fontSize="11" fill="currentColor" fillOpacity="0.6">Illustrative &mdash; the direction is what matters, not exact figures</text>

              <line x1="24" y1="210" x2="700" y2="210" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />

              <rect x="46" y="176" width="76" height="34" rx="3" fill="var(--dg-accent,#2563eb)" fillOpacity="0.5" />
              <rect x="186" y="152" width="76" height="58" rx="3" fill="var(--dg-accent,#2563eb)" fillOpacity="0.5" />
              <rect x="326" y="126" width="76" height="84" rx="3" fill="currentColor" fillOpacity="0.4" />
              <rect x="466" y="92" width="76" height="118" rx="3" fill="currentColor" fillOpacity="0.55" />
              <rect x="606" y="58" width="76" height="152" rx="3" fill="currentColor" fillOpacity="0.7" />

              <g fontSize="12.5" fontWeight="600" textAnchor="middle" fill="currentColor">
                <text x="84" y="228">Design</text>
                <text x="224" y="228">Code</text>
                <text x="364" y="228">Build/CI</text>
                <text x="504" y="228">Test</text>
                <text x="644" y="228">Production</text>
              </g>
              <g fontSize="10.5" textAnchor="middle" fill="currentColor" fillOpacity="0.65">
                <text x="84" y="244">requirements</text>
                <text x="224" y="244">in the IDE</text>
                <text x="364" y="244">the pipeline</text>
                <text x="504" y="244">QA / staging</text>
                <text x="644" y="244">an incident</text>
              </g>

              <text x="150" y="96" fontSize="12" fontWeight="600" fill="var(--dg-accent,#2563eb)">Shift left: catch it here</text>
              <line x1="150" y1="104" x2="230" y2="150" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.7" strokeWidth="1.5" />
              <path d="M230 150 l-9 -1 l4 -7 z" fill="var(--dg-accent,#2563eb)" fillOpacity="0.8" />
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The practices that make it real</h2>
          <p className="text-sm muted">
            Shift left is only a slogan until it is a set of automated checks in specific places.
            The ones that carry most of the weight:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Threat modeling at design.</strong> The cheapest security work happens before
              any code exists &mdash; asking what could go wrong with a feature and designing the
              controls in. No tool required, just the habit.
            </li>
            <li>
              <strong>Secret scanning at commit.</strong> A pre-commit hook or CI check that blocks
              hardcoded credentials stops the single most common and most damaging accidental leak
              before it ever reaches history.
            </li>
            <li>
              <strong>Static analysis (SAST).</strong> Analyzing source for injection, unsafe
              deserialization, and similar weakness classes as it is written. See{" "}
              <Link href="/blog/sast-vs-dast-explained" className="underline">
                SAST vs DAST
              </Link>{" "}
              for what static analysis catches and what it structurally cannot.
            </li>
            <li>
              <strong>Dependency scanning (SCA).</strong> Most modern applications are mostly
              open-source code. <Link href="/blog/what-is-software-composition-analysis" className="underline">
                Software composition analysis
              </Link>{" "}
              flags known-vulnerable dependencies in the pull request, where a version bump is trivial.
            </li>
            <li>
              <strong>Image and IaC scanning in CI.</strong> Scanning the built container and the
              infrastructure-as-code that deploys it, in the pipeline, before either can ship. This
              is where a{" "}
              <Link href="/blog/container-image-scanning-guide" className="underline">
                container image scan
              </Link>{" "}
              belongs.
            </li>
            <li>
              <strong>Pull-request gates.</strong> Wiring those checks to block merges turns policy
              into a required status check &mdash; the mechanism that makes shift left stick instead
              of drift. Our{" "}
              <Link href="/blog/scan-docker-images-github-actions" className="underline">
                GitHub Actions guide
              </Link>{" "}
              shows the gate concretely.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The trap: shift left is not shift only-left</h2>
          <p className="text-sm muted">
            Two failure modes turn shift left from an improvement into a liability. The first is{" "}
            <strong>noise</strong>. Turn on every scanner at maximum strictness and you get thousands
            of findings, most of them dependencies that are present but never called, or CVEs with no
            realistic exploit path. Developers cannot tell signal from noise at that volume, so they
            learn to ignore the security check entirely &mdash; the opposite of the goal. Effective
            shift left is aggressive about prioritization: gate on what is reachable and exploitable,
            let the rest inform rather than block.
          </p>
          <p className="text-sm muted">
            The second is <strong>believing left is enough</strong>. Some vulnerabilities only appear
            at runtime, under real traffic and real configuration. New advisories are published every
            day against code that shipped clean last week. Runtime protection, dynamic testing, and
            production monitoring &mdash; sometimes called shift right &mdash; are not replaced by
            shift left; they are the other half of the same coverage. A program that scans hard in CI
            and never looks at production has just moved its blind spot, not removed it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook lives at the build and CI stage of the shift-left picture. It scans the artifact
            you are about to ship &mdash; the container image or archive &mdash; and the open-source
            components inside it, matching each against OSV, NVD, and vendor advisory data, and
            returns a JSON report you can gate a pipeline on. Because each finding carries its source
            and a confidence tier, you can tune the gate to reachable, verified findings instead of
            drowning developers in every theoretical match, which is exactly what keeps a shift-left
            gate from becoming the check everyone bypasses. It is one layer of a defense that still
            includes design review to its left and runtime monitoring to its right.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is shift left security?</h3>
              <p className="text-sm muted mt-1">
                Moving security testing earlier in the development lifecycle &mdash; toward design and
                coding &mdash; so problems are caught while they are cheap to fix, rather than at a
                final gate before release.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is it cheaper?</h3>
              <p className="text-sm muted mt-1">
                A flaw fixed by its author in code review is a one-line change; the same flaw in
                production is an incident. The multiplier is debated but the direction is not.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it replace production testing?</h3>
              <p className="text-sm muted mt-1">
                No. Shift left is not shift-only-left. Runtime issues and post-release advisories
                still need DAST and production monitoring &mdash; the other half of coverage.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the biggest mistake?</h3>
              <p className="text-sm muted mt-1">
                Drowning developers in unprioritized findings. Too much noise and they ignore the
                whole thing; gate on what is reachable and exploitable.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Shift your image scanning left</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook scans the container you are about to ship right in your pipeline, matching every
            package against OSV, NVD, and vendor advisory data &mdash; with confidence tiers so you
            can gate on what is real instead of drowning developers in noise.
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
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is SCA?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              Vulnerability Management Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

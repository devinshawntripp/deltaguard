import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-23";

const title = `Dependency Confusion: How the Supply Chain Attack Works | ${APP_NAME}`;
const description =
  "Dependency confusion tricks a package manager into installing a malicious public package instead of your private one. How the attack works and how to stop it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "dependency confusion",
    "dependency confusion attack",
    "substitution attack",
    "namespace confusion",
    "private package feed security",
    "npm dependency confusion",
    "pip dependency confusion",
    "supply chain attack",
    "scoped packages",
    "package name squatting",
  ],
  alternates: { canonical: "/blog/dependency-confusion" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/dependency-confusion",
    images: ["/blog/dependency-confusion.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/dependency-confusion.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Dependency Confusion: How the Supply Chain Attack Works",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/dependency-confusion",
  image: "https://scanrook.io/blog/dependency-confusion.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a dependency confusion attack?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dependency confusion, also called a substitution attack, tricks a package manager into installing a malicious public package in place of an intended private one. An attacker publishes a package with the same name as an organization's internal package to a public registry, using a higher version number. When a build resolves dependencies from both the private feed and the public registry, it can pick the attacker's higher-versioned public package and execute its install scripts.",
      },
    },
    {
      "@type": "Question",
      name: "How was dependency confusion discovered?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Security researcher Alex Birsan published the technique in February 2021 in a write-up titled Dependency Confusion. He collected internal package names that leaked in public code and error messages, published harmless packages under those names to npm, PyPI, and RubyGems, and found they were installed inside dozens of major companies including Apple, Microsoft, and PayPal. The research earned more than 130,000 dollars in bug bounties and put the attack class on every supply-chain roadmap.",
      },
    },
    {
      "@type": "Question",
      name: "Why are package managers vulnerable to it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The root cause is version-first resolution across mixed sources. When a client is configured with both a private feed and the public registry and does not bind a package name to a specific source, it fetches the highest available version wherever it lives. An attacker only needs to publish the same name publicly with a version like 9999.0.0 to win the resolution. pip's --extra-index-url and unscoped npm packages are the classic exposure points.",
      },
    },
    {
      "@type": "Question",
      name: "How do I prevent dependency confusion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bind internal package names to a single trusted source: use scoped npm packages mapped to your registry in .npmrc, pin pip to one index with --index-url rather than merging with --extra-index-url, and route everything through one virtual repository that resolves internal-first. Reserve your internal names on the public registries so no one else can claim them, and enforce lockfile integrity hashes so a substituted artifact fails verification.",
      },
    },
    {
      "@type": "Question",
      name: "Can a vulnerability scanner catch dependency confusion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not directly, and it should not be your primary control. Dependency confusion is a resolution and configuration problem solved by registry scoping and namespace reservation. But scanning the built artifact does help downstream: it inventories exactly which package names and versions actually landed, so an unexpected public package that displaced an internal one becomes visible in the report rather than silently shipping.",
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
            Dependency Confusion: How the Supply Chain Attack Works
          </h1>
          <p className="text-sm muted">Published December 23, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Dependency confusion is one of the simplest and most effective supply-chain attacks ever
            demonstrated: publish a package with the same name as a company&apos;s internal one, give
            it a higher version number, and wait for the build to pull yours instead. No exploit, no
            memory corruption &mdash; just the package manager doing exactly what it was told. Here is
            how it works, why it worked against some of the largest companies in the world, and how
            to close it.
          </p>
        </header>

        <img
          src="/blog/dependency-confusion.jpg"
          alt="Dependency confusion supply chain attack"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The attack in one sentence</h2>
          <p className="text-sm muted">
            Dependency confusion &mdash; also called a substitution attack &mdash; abuses the fact
            that many build tools resolve packages by version number across multiple sources at once.
            If your organization uses an internal package named
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">acme-internal-utils</code>{" "}
            served from a private feed, an attacker can publish a package with that same name to the
            public npm registry at version <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">9999.0.0</code>.
            When your build asks for the latest <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">acme-internal-utils</code>{" "}
            and sees both sources, the public one wins on version, and its install scripts run inside
            your CI or developer machine.
          </p>
          <p className="text-sm muted">
            It is a member of the broader family covered in{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            , and it is particularly nasty because nothing in the artifact looks malicious to a
            casual review &mdash; the name and version are the entire exploit.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the resolution goes wrong</h2>
          <p className="text-sm muted">
            The diagram below shows the decision that fails. The client is configured to look in two
            places and, absent a rule binding the name to the private feed, it simply takes the
            highest version it can find.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 820 260"
              role="img"
              aria-label="A build requesting an internal package sees a private feed at version 1.4.0 and a public registry at version 9999.0.0, and version-first resolution installs the malicious public package"
              className="w-full h-auto text-black dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="820" height="260" rx="16" className="fill-black/[.02] dark:fill-white/[.02]" />

              <rect x="24" y="100" width="150" height="60" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
              <text x="99" y="126" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Build / CI</text>
              <text x="99" y="144" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">wants acme-utils</text>

              <line x1="174" y1="118" x2="300" y2="70" className="stroke-current" strokeWidth="1.5" opacity="0.4" markerEnd="url(#dc)" />
              <line x1="174" y1="142" x2="300" y2="190" className="stroke-current" strokeWidth="1.5" opacity="0.4" markerEnd="url(#dc)" />

              <rect x="302" y="40" width="220" height="64" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
              <text x="412" y="66" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Private feed</text>
              <text x="412" y="84" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">acme-utils @ 1.4.0 (real)</text>

              <rect x="302" y="158" width="220" height="64" rx="10" className="fill-red-500/10 stroke-red-500/60" strokeWidth="1.5" />
              <text x="412" y="184" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Public registry</text>
              <text x="412" y="202" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.7">acme-utils @ 9999.0.0 (attacker)</text>

              <line x1="522" y1="190" x2="640" y2="140" className="stroke-red-500/70" strokeWidth="2" markerEnd="url(#dcr)" />

              <rect x="642" y="108" width="154" height="64" rx="10" className="fill-red-500/10 stroke-red-500/60" strokeWidth="1.5" />
              <text x="719" y="134" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Installed</text>
              <text x="719" y="152" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.7">highest version wins</text>

              <text x="410" y="244" textAnchor="middle" className="fill-current" fontSize="11" opacity="0.55">Version-first resolution across mixed sources picks 9999.0.0</text>

              <defs>
                <marker id="dc" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" className="fill-current" opacity="0.5" />
                </marker>
                <marker id="dcr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" className="fill-red-500" opacity="0.8" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Alex Birsan and the 2021 disclosure</h2>
          <p className="text-sm muted">
            The attack was demonstrated at scale by security researcher Alex Birsan, whose February
            2021 write-up &mdash; simply titled <em>Dependency Confusion</em> &mdash; showed it
            working against dozens of major companies. His method was almost mundane. He harvested
            internal package names that had leaked into public view: names referenced in
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package.json</code> files pushed to public repos, in JavaScript bundles, in stack traces.
            Then he published harmless packages under those exact names to npm, PyPI, and RubyGems,
            each phoning home with only non-sensitive host and user data via DNS.
          </p>
          <p className="text-sm muted">
            The callbacks arrived from inside Apple, Microsoft, PayPal, Shopify, Netflix, Uber, Tesla,
            Yelp and others &mdash; more than thirty-five organizations in total &mdash; earning over
            130,000 dollars in bug bounties. Nothing about the technique required breaking encryption
            or finding a memory bug. It exploited a design assumption baked into package managers:
            that a package name maps to one obvious source. When it maps to two, and resolution
            prefers the higher version, the public internet gets a vote on what runs inside your
            firewall.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where the exposure lives</h2>
          <p className="text-sm muted">
            The same pattern shows up across ecosystems, each with its own weak spot:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>npm.</strong> Unscoped internal packages are the classic case. If
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">acme-utils</code> is not tied to a scope and registry, npm and Yarn will consider the
              public copy.
            </li>
            <li>
              <strong>pip / PyPI.</strong> The danger is
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--extra-index-url</code>. pip merges all configured indexes into one candidate set and
              picks the highest version, with no notion of which index is authoritative. PyPI also has
              no true namespaces, so any name is claimable.
            </li>
            <li>
              <strong>RubyGems, and others.</strong> Any tool that can be pointed at multiple sources
              and resolves by version is susceptible in principle; the details differ but the shape is
              identical.
            </li>
          </ul>
          <p className="text-sm muted">
            The common ingredient is a leaked internal name plus a client that trusts version numbers
            more than sources. Remove either and the attack fails.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to prevent it</h2>
          <p className="text-sm muted">
            The fix is configuration, not a product. The goal is to bind every internal name to a
            single trusted source so a public package can never satisfy it. Concretely:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Scope and pin npm packages.</strong> Publish internal packages under a scope
              (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">@acme/utils</code>) and map that scope to your registry in
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.npmrc</code>, so the scope resolves only there.
            </li>
            <li>
              <strong>Use one pip index.</strong> Prefer a single
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--index-url</code> pointed at a controlled proxy over merging with
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--extra-index-url</code>, and enforce
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--require-hashes</code>.
            </li>
            <li>
              <strong>Route through one virtual repository.</strong> A proxy such as Artifactory,
              Nexus, or Azure Artifacts can resolve internal-first and only fall through to the public
              upstream for names it does not own.
            </li>
            <li>
              <strong>Reserve your names publicly.</strong> Publish placeholder packages under your
              internal names on the public registries so an attacker cannot claim them.
            </li>
            <li>
              <strong>Enforce lockfile integrity.</strong> Commit lockfiles with integrity hashes and
              verify them in CI so a substituted artifact fails the checksum.
            </li>
          </ul>
          <p className="text-sm muted">
            An example npm scope binding &mdash; the single most effective control &mdash; looks like
            this:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# .npmrc — the @acme scope only ever resolves from the private registry
@acme:registry=https://npm.internal.acme.com/
//npm.internal.acme.com/:_authToken=\${NPM_TOKEN}`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where scanning fits &mdash; and where it does not</h2>
          <p className="text-sm muted">
            It would be dishonest to sell a vulnerability scanner as a dependency-confusion defense.
            The attack is a resolution problem, and it is solved at the package-manager and registry
            layer with the controls above. ScanRook does not rewrite your resolution rules, and no
            scanner should claim to.
          </p>
          <p className="text-sm muted">
            Where scanning earns its place is downstream, as a detective control. When ScanRook scans
            the built artifact, it inventories exactly which package names and versions actually
            landed inside the image &mdash; the real installed state, not the intended manifest. A
            public package that displaced an internal one, or a wildly out-of-band version like
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">9999.0.0</code>, shows up in that inventory instead of shipping unseen. Pair that with{" "}
            <Link href="/blog/npm-audit-explained" className="underline">
              lockfile audits
            </Link>{" "}
            and{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            during the build, and you get prevention at resolution time plus verification of what was
            really produced &mdash; defense in depth rather than a single brittle gate.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is dependency confusion?</h3>
              <p className="text-sm muted mt-1">
                A substitution attack where an attacker publishes a public package with the same name
                as your internal one at a higher version, so a build that checks both sources installs
                the malicious public copy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Who discovered it?</h3>
              <p className="text-sm muted mt-1">
                Alex Birsan demonstrated it at scale in February 2021, reaching dozens of major
                companies including Apple, Microsoft, and PayPal and earning over 130,000 dollars in
                bounties.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does it work?</h3>
              <p className="text-sm muted mt-1">
                Package managers configured with multiple sources resolve by highest version, so a
                public package at 9999.0.0 beats a real internal one unless the name is bound to a
                specific source.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I stop it?</h3>
              <p className="text-sm muted mt-1">
                Scope internal npm packages to your registry, pin pip to one index, route through a
                single virtual repository, reserve internal names publicly, and enforce lockfile
                integrity hashes.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See what actually landed in your image</h3>
          <p className="text-sm muted leading-relaxed">
            Registry scoping prevents dependency confusion; scanning verifies it worked. ScanRook
            inventories the real installed packages and versions in your built artifact, so an
            unexpected substitution surfaces in the report instead of shipping silently.
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
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/npm-audit-explained" className="underline">
              npm audit Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is Software Composition Analysis?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

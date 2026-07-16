import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-14";

const title = `Dependabot Explained: Automated Dependency Security | ${APP_NAME}`;
const description =
  "Dependabot raises alerts and pull requests to fix vulnerable dependencies. How its three features work, what it misses, and where image scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "dependabot",
    "github dependabot",
    "dependabot security updates",
    "dependabot version updates",
    "dependabot alerts",
    "dependabot yml",
    "dependabot vs renovate",
    "automated dependency updates",
    "dependabot configuration",
    "dependency security scanning",
  ],
  alternates: { canonical: "/blog/dependabot" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/dependabot",
    images: ["/blog/dependabot.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/dependabot.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Dependabot Explained: Automated Dependency Security",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/dependabot",
  image: "https://scanrook.io/blog/dependabot.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Dependabot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dependabot is a GitHub feature that keeps your dependencies secure and up to date. It has three parts: alerts that warn you about vulnerable dependencies, security updates that open pull requests to fix them, and version updates that routinely bump dependencies to newer releases. It reads your manifest and lockfiles and uses the GitHub Advisory Database.",
      },
    },
    {
      "@type": "Question",
      name: "Is Dependabot free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Dependabot alerts, security updates, and version updates are free for public and private repositories on GitHub. You enable alerts and security updates in the repository or organization security settings, and configure version updates by committing a dependabot.yml file to the repository.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Dependabot alerts and security updates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alerts notify you that a dependency has a known vulnerability, based on the GitHub Advisory Database. Security updates go a step further and automatically open a pull request that bumps the affected dependency to a fixed version. Alerts tell you; security updates try to fix it for you when a safe upgrade path exists.",
      },
    },
    {
      "@type": "Question",
      name: "What does Dependabot not catch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dependabot reads dependency manifests and lockfiles in supported ecosystems. It does not scan the built container image, so operating-system packages in your base image, binaries copied in during the build, and vendored or manually bundled code are invisible to it. Scanning the final artifact is what covers those gaps.",
      },
    },
    {
      "@type": "Question",
      name: "Dependabot vs Renovate: which should I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both automate dependency updates. Dependabot is built into GitHub with zero infrastructure and is the simplest option for GitHub-hosted projects. Renovate is more configurable, supports more platforms and ecosystems, and offers richer grouping and scheduling, at the cost of more setup. Many teams start with Dependabot and move to Renovate when they need finer control.",
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
            Dependabot Explained: Automated Dependency Security
          </h1>
          <p className="text-sm muted">Published October 14, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Dependabot is the easiest dependency-security win most teams can turn on: it watches your
            manifests for vulnerable and outdated packages and opens pull requests to fix them, for
            free, inside GitHub. It is genuinely useful and worth enabling everywhere. It also has a
            clear boundary &mdash; it only sees what is declared in your manifests, not what ends up
            in the image you ship. Here is how its three features work, how to configure it, and where
            you need something else to cover the gap.
          </p>
        </header>

        <img
          src="/blog/dependabot.jpg"
          alt="Dependabot automated dependency updates"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The three features</h2>
          <p className="text-sm muted">
            &ldquo;Dependabot&rdquo; is really three related features that people tend to lump
            together:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Dependabot alerts.</strong> When a dependency you use has a known vulnerability
              published to the GitHub Advisory Database, Dependabot raises an alert on the repository.
              This is detection only &mdash; it tells you a problem exists.
            </li>
            <li>
              <strong>Dependabot security updates.</strong> For an alert with a known fix, Dependabot
              automatically opens a pull request that bumps the vulnerable dependency to a patched
              version. This is remediation &mdash; it does the upgrade for you when a safe path exists.
            </li>
            <li>
              <strong>Dependabot version updates.</strong> On a schedule you define, Dependabot opens
              pull requests to keep dependencies current even when there is no security issue &mdash;
              routine hygiene that stops you from falling years behind.
            </li>
          </ul>
          <p className="text-sm muted">
            Alerts and security updates are driven by the GitHub Advisory Database, the same curated
            source behind GHSA identifiers. If you want the detail on where that data comes from and
            how it relates to CVE and OSV, see{" "}
            <Link href="/blog/github-security-advisories-explained" className="underline">
              GHSA explained
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Configuring version updates</h2>
          <p className="text-sm muted">
            Alerts and security updates are toggles in your repository or organization security
            settings. Version updates are configured with a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.github/dependabot.yml</code>{" "}
            file. A practical starting configuration for a Node project that also ships a container and
            uses GitHub Actions:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      # Batch minor and patch updates into one PR to cut noise
      minor-and-patch:
        update-types:
          - "minor"
          - "patch"

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"`}</pre>
          <p className="text-sm muted">
            Three things matter here. The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">groups</code>{" "}
            block batches routine minor and patch bumps into a single pull request, which is the
            biggest lever against PR fatigue. The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker</code>{" "}
            ecosystem watches the base image in your Dockerfile&apos;s{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM</code>{" "}
            line and proposes newer tags. And <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">github-actions</code>{" "}
            keeps your workflow actions pinned to current versions, which is a real supply-chain
            surface people forget. For a deeper treatment of keeping base images fresh, see{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              how to automate Docker base image updates
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Dependabot does well</h2>
          <p className="text-sm muted">
            Dependabot&apos;s strengths are its simplicity and its placement. It lives where your code
            already lives, needs no external service, and turns dependency upgrades into ordinary
            reviewed pull requests with changelogs and compatibility scores attached. Because it runs
            continuously, a newly disclosed advisory in a package you already use produces a fix PR
            without anyone watching a feed. For direct and transitive dependencies declared in a
            supported ecosystem, it is close to set-and-forget, and it is a natural fit inside a
            shift-left workflow that catches problems at the source.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Dependabot misses</h2>
          <p className="text-sm muted">
            The boundary is important, because it is easy to assume &ldquo;Dependabot is green,
            therefore the image is clean.&rdquo; Dependabot reads dependency <em>manifests</em> and
            lockfiles. It does not open and inspect the artifact you actually deploy. The layers it
            never sees:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 440 210" role="img" aria-label="What Dependabot covers versus what image scanning covers across the layers of a container" className="w-full max-w-lg mx-auto text-[color:var(--dg-accent,#2563eb)]">
              <text x="0" y="13" fontSize="11" className="fill-current" opacity="0.7">Container layers &mdash; coverage by tool</text>
              <rect x="8" y="24" width="252" height="30" rx="4" className="fill-current" opacity="0.7" stroke="currentColor" />
              <text x="18" y="43" fontSize="12" fill="#fff">Declared app dependencies</text>
              <rect x="8" y="62" width="252" height="30" rx="4" className="fill-current" opacity="0.55" stroke="currentColor" />
              <text x="18" y="81" fontSize="12" fill="#fff">Transitive dependencies (in lockfile)</text>
              <rect x="8" y="100" width="424" height="30" rx="4" className="fill-current" opacity="0.28" stroke="currentColor" />
              <text x="18" y="119" fontSize="12" className="fill-current" opacity="0.95">Vendored / copied-in code</text>
              <rect x="8" y="138" width="424" height="30" rx="4" className="fill-current" opacity="0.28" stroke="currentColor" />
              <text x="18" y="157" fontSize="12" className="fill-current" opacity="0.95">OS packages in the base image</text>
              <rect x="8" y="176" width="424" height="26" rx="4" className="fill-current" opacity="0.28" stroke="currentColor" />
              <text x="18" y="193" fontSize="12" className="fill-current" opacity="0.95">Binaries added during build</text>
              <text x="272" y="43" fontSize="11" className="fill-current" opacity="0.85">Dependabot</text>
              <text x="272" y="81" fontSize="11" className="fill-current" opacity="0.85">Dependabot</text>
              <text x="272" y="119" fontSize="11" className="fill-current" opacity="0.6">image scan</text>
              <text x="272" y="157" fontSize="11" className="fill-current" opacity="0.6">image scan</text>
              <text x="272" y="193" fontSize="11" className="fill-current" opacity="0.6">image scan</text>
            </svg>
          </div>
          <p className="text-sm muted">
            Operating-system packages in your base image are usually the largest source of findings in
            a container, and Dependabot has no view of them. The same goes for a static binary you
            copy in, a dependency vendored into your source tree outside the package manager, or a
            library bundled several layers deep. This is the recurring blind spot between reading a
            manifest and reading the installed state of the real artifact, which we cover in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs advisory matching
            </Link>
            . Dependabot can also be noisy without grouping, and its fix PRs need CI and review before
            merge &mdash; auto-merging security bumps unattended has burned teams when a patch release
            broke a build.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Using Dependabot well</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Enable alerts and security updates on every repository &mdash; there is no reason not to.</li>
            <li>Group minor and patch version updates to keep the pull-request volume manageable.</li>
            <li>Require CI to pass on every Dependabot PR; be cautious with unattended auto-merge on anything but trusted patch bumps.</li>
            <li>Add the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker</code> and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">github-actions</code> ecosystems, not just your language package manager.</li>
            <li>Scan the built image separately to cover OS packages and bundled code Dependabot cannot see.</li>
          </ul>
          <p className="text-sm muted">
            Dependabot is one instrument in a full{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            approach, not the whole of it. It excels at the source-manifest layer; pair it with a
            scanner that reads the artifact for everything below.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits alongside Dependabot</h2>
          <p className="text-sm muted">
            ScanRook and Dependabot cover different layers, and they are complementary rather than
            competing. Keep Dependabot fixing declared dependencies at the pull-request level in your
            source repository. Add ScanRook to scan the built container image, binary, or source
            archive, where it reads the actual installed OS packages and bundled libraries &mdash; the
            layers Dependabot never opens &mdash; and matches them against OSV, NVD, and vendor
            advisory data. The result is that a vulnerable base-image package or a copied-in binary
            gets caught before deploy instead of slipping through because it was never in a manifest.
            Dependabot keeps your source honest; ScanRook keeps the shipped artifact honest.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Does Dependabot scan container images?</h3>
              <p className="text-sm muted mt-1">
                Not the built image. Its docker ecosystem watches the base-image tag in your
                Dockerfile&apos;s FROM line, but it does not inspect the operating-system packages or
                binaries inside the assembled image. For that you need to scan the artifact itself.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What database does Dependabot use?</h3>
              <p className="text-sm muted mt-1">
                Alerts and security updates are driven by the GitHub Advisory Database, GitHub&apos;s
                curated set of advisories for open-source packages, which is also published in the OSV
                format and cross-referenced with CVE identifiers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can Dependabot fix a vulnerability automatically?</h3>
              <p className="text-sm muted mt-1">
                It opens a pull request that upgrades the affected dependency to a patched version when
                a safe path exists. Merging is still your decision, and CI should validate the change
                before it lands.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I turn on version updates or just security updates?</h3>
              <p className="text-sm muted mt-1">
                Security updates are essential. Version updates are valuable but noisier; enable them
                with grouping so routine bumps arrive as batched pull requests rather than a flood of
                individual ones.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the layers Dependabot cannot see</h3>
          <p className="text-sm muted leading-relaxed">
            Dependabot keeps your declared dependencies patched. ScanRook scans the built artifact
            &mdash; OS packages, bundled libraries, and copied-in binaries &mdash; against OSV, NVD,
            and vendor advisories, so the vulnerabilities that never appear in a manifest still get
            caught before you deploy.
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
            <Link href="/blog/github-security-advisories-explained" className="underline">
              GHSA Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is SCA?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              Automate Base Image Updates
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

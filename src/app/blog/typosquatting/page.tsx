import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-08";

const title = `Typosquatting Explained: How Lookalike Packages Attack | ${APP_NAME}`;
const description =
  "Typosquatting tricks developers into installing malicious lookalike packages. How the attack works, real examples, how to defend, and where scanning helps.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "typosquatting",
    "what is typosquatting",
    "typosquatting attack",
    "npm typosquatting",
    "pypi typosquatting",
    "malicious packages",
    "software supply chain attack",
    "package typosquatting",
    "dependency typosquatting",
    "typosquatting prevention",
  ],
  alternates: { canonical: "/blog/typosquatting" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/typosquatting",
    images: ["/blog/typosquatting.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/typosquatting.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Typosquatting Explained: How Lookalike Packages Attack",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/typosquatting",
  image: "https://scanrook.io/blog/typosquatting.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is typosquatting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typosquatting is a supply-chain attack where an adversary publishes a malicious package under a name that closely resembles a popular one, hoping developers install it by mistake. A single mistyped character, a swapped hyphen, or an added suffix is enough. When the lookalike is installed, its code runs with the same access as any other dependency, often stealing credentials or planting a backdoor.",
      },
    },
    {
      "@type": "Question",
      name: "How is typosquatting different from dependency confusion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typosquatting relies on a human typing the wrong name, so the malicious package has a similar-but-different name. Dependency confusion exploits build tooling that pulls a public package with the exact same name as a private internal one, usually by publishing a higher version number. One tricks the developer; the other tricks the resolver. Both end with untrusted code in your build.",
      },
    },
    {
      "@type": "Question",
      name: "What are real examples of typosquatting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In 2017, a campaign on npm published dozens of packages such as crossenv, mimicking the popular cross-env, that stole environment variables on install. In 2019, PyPI removed packages including python3-dateutil and jeIlyfish, whose capital-I name mimicked jellyfish, which attempted to exfiltrate SSH and GPG keys. Both registries have removed many similar packages since.",
      },
    },
    {
      "@type": "Question",
      name: "How do you prevent typosquatting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pin exact versions with a lockfile that records integrity hashes, and double-check every package name before adding it. Disable automatic install scripts where practical, use a curated internal registry or allowlist, and run dependency scanning so known-malicious packages are flagged. Careful review at the moment a dependency is added is the single most effective control.",
      },
    },
    {
      "@type": "Question",
      name: "Can a vulnerability scanner catch typosquatting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Partly. A scanner can flag a package once it has been reported to a malicious-package advisory feed, and its inventory of exactly what was installed lets you audit for suspicious names. But a brand-new lookalike with no advisory yet will not be matched by CVE data alone, so scanning complements prevention rather than replacing it. Lockfiles and name discipline remain the front line.",
      },
    },
  ],
};

const steps = [
  ["1  Publish lookalike", "reqeusts vs requests"],
  ["2  Victim mistypes", "npm / pip install"],
  ["3  Install hook runs", "postinstall / setup.py"],
  ["4  Data exfiltrated", "tokens, SSH keys"],
];

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
            Typosquatting Explained: How Lookalike Packages Attack
          </h1>
          <p className="text-sm muted">Published October 8, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Typosquatting is one of the simplest software supply-chain attacks and one of the most
            effective: publish a malicious package with a name a hair away from a popular one, and
            wait for a mistyped install. This guide explains how typosquatting works, the naming
            tricks attackers use, real incidents on npm and PyPI, how to defend against it, and
            honestly where scanning does and does not help.
          </p>
        </header>

        <img
          src="/blog/typosquatting.jpg"
          alt="How typosquatting attacks work"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What typosquatting is</h2>
          <p className="text-sm muted">
            Typosquatting takes its name from the older domain trick of registering misspelled URLs
            to catch fat-fingered visitors. In the software supply chain, the target is a package
            registry &mdash; npm, PyPI, RubyGems, and others &mdash; and the bait is a package whose
            name closely resembles a widely-used one. Because public registries let anyone publish,
            an attacker can upload <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">reqeusts</code>{" "}
            next to the genuinely popular{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">requests</code> and simply
            wait.
          </p>
          <p className="text-sm muted">
            The reason it works is that a dependency is not passive data. When you install a package,
            its code can run &mdash; and it runs with whatever access your developer machine or CI
            runner has: environment variables, cloud credentials, SSH keys, source code. A typo at
            the install prompt is enough to hand all of that to a stranger. It is a textbook example
            of the risks covered in{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the attack unfolds</h2>
          <p className="text-sm muted">
            Most typosquatting campaigns follow the same four beats, from publication to payoff:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 130"
              className="w-full"
              style={{ minWidth: 640 }}
              role="img"
              aria-label="Typosquatting attack flow: publish lookalike, victim mistypes, install hook runs, data exfiltrated"
            >
              <g fontSize="11" textAnchor="middle" fill="currentColor">
                {steps.map((s, i) => {
                  const x = 10 + i * 178;
                  return (
                    <g key={i}>
                      <rect x={x} y="26" width="155" height="52" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.10" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                      <text x={x + 77} y="50" fontWeight="600">{s[0]}</text>
                      <text x={x + 77} y="66" fontSize="10" fillOpacity="0.85">{s[1]}</text>
                      {i < steps.length - 1 && (
                        <line x1={x + 155} y1="52" x2={x + 178} y2="52" stroke="currentColor" strokeOpacity="0.4" />
                      )}
                    </g>
                  );
                })}
                <text x="360" y="102" fontSize="10" fillOpacity="0.75">Steps 3 and 4 happen automatically, in seconds, before anyone notices.</text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            The dangerous part is how much of this needs no interaction. Both{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm</code> and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pip</code> can execute
            code during installation &mdash; npm through lifecycle scripts like{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">postinstall</code>, Python
            through <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">setup.py</code>{" "}
            &mdash; so the malicious payload fires the moment the wrong name is installed, well before
            any of the code is ever imported.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The naming tricks</h2>
          <p className="text-sm muted">
            Attackers exploit a handful of predictable ways a name can look right at a glance:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Character omission or transposition.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">reqeusts</code> for
              requests, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">urllib</code>{" "}
              variants &mdash; a single dropped or swapped letter.
            </li>
            <li>
              <strong>Homoglyphs.</strong> Characters that look identical in some fonts, like a
              capital <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">I</code> standing
              in for a lowercase <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">l</code>.
            </li>
            <li>
              <strong>Added or altered separators and suffixes.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">python3-dateutil</code>{" "}
              for python-dateutil, or a spurious plural.
            </li>
            <li>
              <strong>Brand confusion.</strong> A plausible-sounding companion to a real package that
              a hurried developer assumes must be official.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Real incidents</h2>
          <p className="text-sm muted">
            These are not hypothetical. In 2017, a campaign on npm published dozens of packages
            &mdash; the best-known being{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">crossenv</code>,
            mimicking the popular{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cross-env</code> &mdash;
            that harvested environment variables and shipped them to an attacker-controlled server on
            install. The packages were removed, but not before real installs occurred.
          </p>
          <p className="text-sm muted">
            In 2019, PyPI removed packages including{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">python3-dateutil</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">jeIlyfish</code>{" "}
            &mdash; the latter using a capital <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">I</code> to
            impersonate the legitimate{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">jellyfish</code> library
            &mdash; that attempted to steal SSH and GPG keys. Both npm and PyPI have since removed
            thousands of malicious packages and added automated detection, but the arms race
            continues because publishing is still open by design. Each of these was, in effect, a{" "}
            <Link href="/blog/what-is-a-vulnerability" className="underline">
              vulnerability
            </Link>{" "}
            introduced not by a bug but by a name.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Typosquatting and its cousins</h2>
          <p className="text-sm muted">
            Typosquatting is one branch of a larger family of package-name and trust attacks, and it
            helps to keep them straight because the defenses overlap:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Dependency confusion</strong> exploits build tools that prefer a public
              package over a private one of the same name, often by publishing a higher version. No
              typo is required &mdash; the resolver is the victim, not the developer.
            </li>
            <li>
              <strong>Brandjacking and combosquatting</strong> add a plausible word to a trusted name
              (a fake &ldquo;-sdk&rdquo; or &ldquo;-utils&rdquo; companion) so it reads as an official
              extension of a real project.
            </li>
            <li>
              <strong>Maintainer account takeover</strong> hijacks a legitimate, already-trusted
              package through a compromised credential, then ships malware in an update &mdash; no
              lookalike name at all, which makes it harder to spot.
            </li>
          </ul>
          <p className="text-sm muted">
            The common thread is that a name you trust is not the same as code you have verified.
            Typosquatting is the cheapest of these to attempt, which is exactly why it stays common:
            publishing a package costs nothing, and one careless install anywhere in the world is a
            success for the attacker.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to defend</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Pin and lock everything.</strong> A lockfile with integrity hashes
              (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package-lock.json</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">poetry.lock</code>) means
              a resolved, verified set of packages installs the same way every time &mdash; a
              surprise dependency cannot slip in silently.
            </li>
            <li>
              <strong>Verify the name at the moment you add it.</strong> Copy package names from
              official docs, not memory or a search result. The most effective control is the
              two-second check before the first install.
            </li>
            <li>
              <strong>Disable install scripts where you can.</strong> Installing with{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--ignore-scripts</code>{" "}
              removes the most common payload trigger, though it can break packages that legitimately
              build on install.
            </li>
            <li>
              <strong>Use a curated registry or allowlist.</strong> An internal proxy that only
              serves vetted packages stops an unknown lookalike from ever resolving.
            </li>
            <li>
              <strong>Scan your dependencies.</strong>{" "}
              <Link href="/blog/what-is-software-composition-analysis" className="underline">
                Software composition analysis
              </Link>{" "}
              and tools like{" "}
              <Link href="/blog/npm-audit-explained" className="underline">
                npm audit
              </Link>{" "}
              flag packages once they are reported, adding a safety net behind the human check.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits (and where it does not)</h2>
          <p className="text-sm muted">
            Being honest matters here, because typosquatting is a case where no scanner is a silver
            bullet. ScanRook inventories every package that actually ended up inside your built
            artifact and matches them against multiple advisory sources, including malicious-package
            feeds &mdash; so once a lookalike has been reported, it surfaces in your report with its
            source noted. Just as important, the precise installed-package inventory gives you a
            concrete list to audit: if a name looks off, you can see exactly which artifacts contain
            it.
          </p>
          <p className="text-sm muted">
            What ScanRook cannot do is catch a brand-new typosquat that no advisory has documented
            yet &mdash; CVE and advisory matching only knows what has been reported. That is why the
            durable defenses are preventive: lockfiles, name discipline, and a curated registry.
            Scanning is the layer that catches what slips through and gives you an audit trail, not a
            replacement for getting the dependency right in the first place. Signing and provenance,
            covered in{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              image signing with Sigstore and Cosign
            </Link>
            , add another layer once the trusted artifact is built.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is typosquatting?</h3>
              <p className="text-sm muted mt-1">
                A supply-chain attack that publishes a malicious package under a name resembling a
                popular one, so a mistyped install runs attacker code with your build&apos;s access.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is it different from dependency confusion?</h3>
              <p className="text-sm muted mt-1">
                Typosquatting tricks a human into typing the wrong name; dependency confusion tricks
                the resolver into pulling a public package with the same name as a private one.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are real examples?</h3>
              <p className="text-sm muted mt-1">
                npm&apos;s crossenv campaign (2017) stealing environment variables, and PyPI&apos;s
                python3-dateutil and jeIlyfish (2019) targeting SSH and GPG keys.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do you prevent it?</h3>
              <p className="text-sm muted mt-1">
                Pin versions with a hash-verified lockfile, verify names before adding them, disable
                install scripts where practical, use a curated registry, and scan dependencies.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know exactly what ended up in your build</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook inventories every package inside your artifact and matches them against OSV, NVD,
            and malicious-package feeds &mdash; giving you a precise, auditable list to catch what
            slipped past the lockfile, with a source on every finding.
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
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is SCA?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/npm-audit-explained" className="underline">
              npm audit Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-19";

const title = `FIPS 140-2 Explained: Levels, Validation, and Containers | ${APP_NAME}`;
const description =
  "FIPS 140-2 validates cryptographic modules for US federal use. What the four levels mean, how FIPS 140-3 supersedes it, and how to run FIPS mode in containers.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "fips 140-2",
    "fips 140-2 validation",
    "fips 140-2 levels",
    "fips 140-3",
    "cryptographic module validation program",
    "fips mode linux",
    "fips compliant containers",
    "cmvp certificate",
    "fips 140-2 vs 140-3",
    "openssl fips provider",
  ],
  alternates: { canonical: "/blog/fips-140-2" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/fips-140-2",
    images: ["/blog/fips-140-2.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/fips-140-2.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "FIPS 140-2 Explained: Levels, Validation, and Containers",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/fips-140-2",
  image: "https://scanrook.io/blog/fips-140-2.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is FIPS 140-2?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FIPS 140-2 is a US federal standard titled Security Requirements for Cryptographic Modules. It defines what a cryptographic module must do to be acceptable for protecting sensitive information in US federal systems, and it is enforced through the Cryptographic Module Validation Program, a joint NIST and Canadian Centre for Cyber Security scheme in which accredited laboratories test modules against the standard.",
      },
    },
    {
      "@type": "Question",
      name: "What are the four FIPS 140-2 security levels?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Level 1 requires only approved algorithms with no physical security, which is where software modules normally land. Level 2 adds role-based authentication and tamper-evidence. Level 3 adds identity-based authentication, tamper-resistance and key zeroization on intrusion. Level 4 requires a complete protective envelope that detects and responds to environmental attacks.",
      },
    },
    {
      "@type": "Question",
      name: "Has FIPS 140-2 been replaced by FIPS 140-3?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. FIPS 140-3 is the current standard and aligns the requirements with ISO/IEC 19790 and ISO/IEC 24759. The validation program stopped accepting new FIPS 140-2 submissions in September 2021, and existing FIPS 140-2 certificates move to the historical list five years after validation. New work should target FIPS 140-3 modules.",
      },
    },
    {
      "@type": "Question",
      name: "How do you run FIPS mode in a container?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Two things have to line up. The host kernel must be running in FIPS mode, because containers share the host kernel and its crypto subsystem. And the image itself must ship a FIPS-validated cryptographic library and be configured to use it. A container built on a general-purpose base image does not become FIPS compliant just because the host has FIPS mode enabled.",
      },
    },
    {
      "@type": "Question",
      name: "Does patching break FIPS validation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It can. A certificate covers a specific module version in a specific operational environment, so replacing the validated binary with a newer build technically falls outside the certificate boundary. Vendors handle this with security-patched builds that keep the validated module intact, which is why FIPS-validated environments usually consume vendor-maintained packages rather than upstream releases.",
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
            FIPS 140-2 Explained: Levels, Validation, and Containers
          </h1>
          <p className="text-sm muted">Published September 19, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            FIPS 140-2 is the standard that decides whether the cryptography in your product is
            acceptable to a US federal buyer. It is also one of the most misquoted requirements in
            procurement, partly because &ldquo;FIPS compliant&rdquo; and &ldquo;FIPS
            validated&rdquo; are not the same claim. Here is what the standard actually covers, how
            its four levels differ, where FIPS 140-3 leaves it, and what it takes to run a container
            workload that genuinely satisfies it.
          </p>
        </header>

        <img
          src="/blog/fips-140-2.jpg"
          alt="FIPS 140-2 cryptographic module validation illustrated as layered protective shells"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the standard actually is</h2>
          <p className="text-sm muted">
            FIPS 140-2 is a Federal Information Processing Standard published by NIST, titled{" "}
            <em>Security Requirements for Cryptographic Modules</em>. Its subject is narrow and
            worth stating precisely: it governs <strong>cryptographic modules</strong> &mdash; the
            hardware, firmware or software component that implements approved algorithms and
            protects keys &mdash; not applications, not networks, and not your organisation&apos;s
            security posture generally.
          </p>
          <p className="text-sm muted">
            Enforcement runs through the Cryptographic Module Validation Program (CMVP), operated
            jointly by NIST and the Canadian Centre for Cyber Security. A vendor engages an
            accredited laboratory, the lab tests the module against the standard&apos;s requirement
            areas, and if it passes, CMVP issues a certificate that lists the module name, version,
            security level, the approved algorithms it implements, and the specific operational
            environments it was tested in. That last field trips people up constantly: a certificate
            for a library on RHEL 9 does not automatically cover the same library on a different
            distribution.
          </p>
          <p className="text-sm muted">
            The standard organises its requirements into areas covering module specification, ports
            and interfaces, roles and authentication, the finite state model, physical security, the
            operational environment, key management, electromagnetic interference, self-tests,
            design assurance, and mitigation of other attacks. A module gets an independent rating
            in each area, and its overall level is the lowest of them &mdash; so an otherwise strong
            module with weak physical security is rated by the weak part.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The four security levels</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Level</th>
                  <th className="text-left py-2 pr-4 font-semibold">Adds</th>
                  <th className="text-left py-2 pr-4 font-semibold">Typical form</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4">1</td>
                  <td className="py-2 pr-4">Approved algorithms; no physical security required</td>
                  <td className="py-2 pr-4">Software crypto library</td>
                </tr>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4">2</td>
                  <td className="py-2 pr-4">Role-based authentication; tamper-evident seals or coatings</td>
                  <td className="py-2 pr-4">Appliance, smartcard</td>
                </tr>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4">3</td>
                  <td className="py-2 pr-4">Identity-based authentication; tamper-resistance; zeroization on intrusion</td>
                  <td className="py-2 pr-4">HSM, secure element</td>
                </tr>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4">4</td>
                  <td className="py-2 pr-4">Complete protective envelope; environmental attack detection</td>
                  <td className="py-2 pr-4">High-assurance HSM</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            For anyone shipping software, Level&nbsp;1 is the realistic target, and it is what almost
            every &ldquo;FIPS validated&rdquo; software library on the CMVP list holds. Levels 2 and
            above assume physical hardware you can seal, drill into, or wrap. If a requirement
            document asks for &ldquo;FIPS 140-2 Level 3&rdquo; for a pure software product, that is
            usually a specification error worth clarifying before you bid.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            FIPS 140-2 versus FIPS 140-3, and the timeline that matters
          </h2>
          <p className="text-sm muted">
            FIPS 140-3 is the successor and the current standard. Rather than re-specifying
            everything, it adopts ISO/IEC 19790:2012 for requirements and ISO/IEC 24759:2017 for the
            test methods, with NIST-specific modifications layered on top. The practical differences
            for a software module are tighter self-test and integrity requirements, updated key
            management expectations, and stricter handling of non-approved algorithm paths.
          </p>
          <p className="text-sm muted">
            The transition is administrative rather than technical, and it has a schedule. CMVP
            stopped accepting new FIPS 140-2 submissions in September 2021, and validated FIPS 140-2
            certificates move to the historical list five years after validation &mdash; a sunset
            that has now arrived. A module on the historical list is not retroactively insecure, but
            federal buyers generally cannot treat it as satisfying a current requirement. If you are
            planning a compliance roadmap today, plan against 140-3.
          </p>
        </section>

        <figure className="grid gap-2">
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 170"
              role="img"
              aria-label="Timeline of the FIPS 140 standards: FIPS 140-2 published, FIPS 140-3 approved, FIPS 140-2 submissions closed, FIPS 140-2 certificates move to the historical list"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <line x1={20} y1={92} x2={700} y2={92} stroke="currentColor" strokeOpacity={0.35} strokeWidth={2} />
              {[
                { x: 60, year: "2001", label: "FIPS 140-2", sub: "published" },
                { x: 250, year: "2019", label: "FIPS 140-3", sub: "approved" },
                { x: 440, year: "2021", label: "140-2 submissions", sub: "closed by CMVP" },
                { x: 640, year: "2026", label: "140-2 certificates", sub: "move to historical", hot: true },
              ].map((m) => (
                <g key={m.year}>
                  <circle cx={m.x} cy={92} r={m.hot ? 8 : 6} fill={m.hot ? "var(--dg-accent,#2563eb)" : "currentColor"} fillOpacity={m.hot ? 0.9 : 0.55} />
                  <text x={m.x} y={40} textAnchor="middle" fontSize="15" fontWeight="600" fill="currentColor">
                    {m.year}
                  </text>
                  <text x={m.x} y={60} textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity={0.8}>
                    {m.label}
                  </text>
                  <text x={m.x} y={76} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.55}>
                    {m.sub}
                  </text>
                </g>
              ))}
              <rect x={20} y={116} width={230} height={26} rx={5} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.25} />
              <text x={135} y={133} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.7}>140-2 accepting new modules</text>
              <rect x={262} y={116} width={438} height={26} rx={5} fill="var(--dg-accent,#2563eb)" fillOpacity={0.1} stroke="currentColor" strokeOpacity={0.3} />
              <text x={481} y={133} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>140-3 is the target for new validations</text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            The FIPS 140 transition, drawn as a timeline. Dates are the published CMVP programme
            milestones, not estimates.
          </figcaption>
        </figure>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Validated, compliant, and &ldquo;FIPS mode&rdquo;</h2>
          <p className="text-sm muted">
            Three phrases get used interchangeably and mean different things.{" "}
            <strong>FIPS validated</strong> means a specific module version holds a CMVP
            certificate; you can look it up by number. <strong>FIPS compliant</strong> usually means
            a product uses a validated module somewhere, which is a much weaker claim and one worth
            interrogating &mdash; ask which certificate, and whether the certificate&apos;s
            operational environment matches your deployment. <strong>FIPS mode</strong> is a runtime
            configuration in which the system restricts itself to approved algorithms and runs the
            required power-on self-tests.
          </p>
          <p className="text-sm muted">
            On a Red Hat-family Linux host, FIPS mode is a system-wide setting that also flips the
            crypto policy, and it can be checked directly:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# enable system-wide FIPS mode (reboot required)
sudo fips-mode-setup --enable
sudo reboot

# verify after reboot
fips-mode-setup --check
sysctl crypto.fips_enabled        # expect: crypto.fips_enabled = 1
update-crypto-policies --show     # expect: FIPS`}</pre>
          <p className="text-sm muted">
            The observable effect is that non-approved algorithms start failing. MD5 for anything
            security-relevant, small RSA keys, and older TLS versions will be rejected outright.
            That is the point &mdash; but it also means enabling FIPS mode is a behavioural change,
            not a checkbox, and it needs testing before it reaches production.
          </p>
        </section>

        <img
          src="/blog/fips-140-2-2.jpg"
          alt="Cryptographic boundary diagram for a FIPS 140-2 validated module"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">FIPS 140-2 in containers</h2>
          <p className="text-sm muted">
            Containers make the FIPS question awkward because the compliance boundary is split
            across two things you often manage separately.
          </p>
          <p className="text-sm muted">
            The first is the <strong>host kernel</strong>. Containers share it, so kernel-level
            crypto and the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">crypto.fips_enabled</code>{" "}
            state come from the node, not the image. You cannot enable FIPS mode from inside an
            unprivileged container. In Kubernetes that means the node image and its build pipeline
            are part of your compliance story, which is a good argument for a small, controlled set
            of node images.
          </p>
          <p className="text-sm muted">
            The second is <strong>userspace crypto inside the image</strong>. This is where most
            claimed FIPS deployments actually fail. If your application links a general-purpose
            OpenSSL build, or is a Go binary with the standard library&apos;s pure-Go crypto
            compiled in, the crypto it executes is not a validated module regardless of what the
            host reports. Getting this right generally means one of:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              A vendor base image built around a validated crypto library, with the OpenSSL 3.x FIPS
              provider configured and loaded.
            </li>
            <li>
              A language runtime with an explicit FIPS build path &mdash; recent Go releases, for
              example, expose a FIPS 140 mode that routes standard-library crypto through a
              dedicated module rather than the general implementation.
            </li>
            <li>
              Delegating crypto entirely to an external validated module such as a network HSM or a
              cloud KMS, so the container never performs the sensitive operation itself.
            </li>
          </ul>
          <p className="text-sm muted">
            Minimal base images are usually the wrong starting point here. Alpine and most
            distroless variants are excellent for{" "}
            <Link href="/blog/minimal-docker-images-guide" className="underline">
              reducing attack surface
            </Link>{" "}
            but do not ship validated crypto modules, so a FIPS requirement typically pushes you
            back to a vendor-maintained base with a larger package footprint. That trade-off is
            real, and it is worth documenting rather than discovering during an audit.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The patching tension nobody warns you about
          </h2>
          <p className="text-sm muted">
            Here is the conflict that catches teams: a CMVP certificate covers a <em>specific
            version</em> of a module. Rebuild that library from a newer upstream release and you are
            no longer running the validated artifact, even if the new version is objectively more
            secure. Meanwhile your scanner is quite correctly reporting a CVE in the pinned version.
          </p>
          <p className="text-sm muted">
            In practice this is managed, not solved. Vendors who maintain validated modules issue
            security-patched builds and pursue revalidation or scope updates for them, which is why
            FIPS environments almost always consume vendor packages rather than upstream tarballs.
            The operational consequence for your team is that some findings against a validated
            crypto library are genuinely not yours to fix by upgrading &mdash; they need a vendor
            advisory, a backported fix, or a documented compensating control. That is the same
            pattern as{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              Red Hat backporting
            </Link>
            , where the upstream version number tells you very little about whether the flaw is
            actually present.
          </p>
          <p className="text-sm muted">
            The right handling is to record these as accepted-with-justification rather than
            silently suppressing them, so the next audit can see the reasoning. Our{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>{" "}
            covers how that fits alongside other control frameworks, and{" "}
            <Link href="/blog/nist-800-53" className="underline">
              NIST 800-53
            </Link>{" "}
            is usually the control catalogue that pulled FIPS into your scope in the first place.
          </p>
        </section>

        <img
          src="/blog/fips-140-2-3.jpg"
          alt="Assurance tiers in the cryptographic module validation process"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not validate cryptographic modules &mdash; nothing except an accredited
            laboratory can do that, and any tool claiming to make an image &ldquo;FIPS
            compliant&rdquo; is overselling. What a scanner contributes is inventory and evidence.
            ScanRook reads the actual installed package databases in an image and reports the exact
            versions of OpenSSL, GnuTLS, NSS, and the language runtimes present, which is precisely
            the list an auditor asks for when checking that the crypto in the image is the crypto
            you claim.
          </p>
          <p className="text-sm muted">
            It also surfaces the awkward cases: a second, unexpected OpenSSL copy vendored into an
            application directory, or a statically linked binary carrying its own crypto. Those are
            the findings that quietly break a FIPS claim, and they show up as ordinary package and
            binary findings in a scan. Pair that with an{" "}
            <Link href="/blog/what-is-a-cbom" className="underline">
              inventory of cryptographic assets
            </Link>{" "}
            and you have a defensible picture of what your image really executes &mdash; which is
            the part of a FIPS story you can actually automate.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is FIPS 140-2 still valid in 2026?</h3>
              <p className="text-sm muted mt-1">
                New validations have not been accepted since 2021, and existing certificates have
                reached the five-year point that moves them to the historical list. Target FIPS
                140-3 for anything new.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which level do software products need?</h3>
              <p className="text-sm muted mt-1">
                Level 1 in almost all cases. Levels 2 through 4 add physical-security requirements
                that only make sense for hardware modules such as HSMs and secure elements.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can a container be FIPS validated?</h3>
              <p className="text-sm muted mt-1">
                A container image is not itself a module. The crypto library inside it can hold a
                certificate, and the host kernel must be in FIPS mode. Both conditions have to hold.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does FIPS mode make a system more secure?</h3>
              <p className="text-sm muted mt-1">
                It constrains you to approved algorithms and mandates self-tests, which removes some
                weak choices. It says nothing about unpatched packages, misconfiguration, or
                application logic.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know exactly what crypto ships in your image</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads installed package databases and binaries directly, so you get the real
            versions of every crypto library in the artifact &mdash; including the vendored copies
            you did not know were there.
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
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Compliance Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/nist-800-53" className="underline">
              NIST 800-53
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-a-cbom" className="underline">
              What Is a CBOM?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

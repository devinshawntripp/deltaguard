import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-14";

const title = `Immutable Infrastructure: Why Rebuilds Beat Patching | ${APP_NAME}`;
const description =
  "Immutable infrastructure replaces servers instead of patching them. What it means in practice, the security properties it buys, its real costs, and how to adopt it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "immutable infrastructure",
    "immutable servers",
    "golden image pipeline",
    "phoenix servers",
    "configuration drift",
    "immutable deployment",
    "read only root filesystem",
    "container immutability",
    "rebuild vs patch",
    "infrastructure as code security",
  ],
  alternates: { canonical: "/blog/immutable-infrastructure" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/immutable-infrastructure",
    images: ["/blog/immutable-infrastructure.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/immutable-infrastructure.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Immutable Infrastructure: Why Rebuilds Beat Patching",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/immutable-infrastructure",
  image: "https://scanrook.io/blog/immutable-infrastructure.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is immutable infrastructure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Immutable infrastructure is an operating model where running components are never modified in place. To change anything — a package version, a config value, an application release — you build a new artifact from source and replace the running instance with it. The old instance is destroyed rather than updated.",
      },
    },
    {
      "@type": "Question",
      name: "How does immutable infrastructure improve security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It eliminates configuration drift, so what you scanned is what runs. It gives every deployed artifact a known provenance and a build pipeline you can attest to. And because instances are replaced regularly, anything an attacker installs on a running host has a short lifespan by default rather than persisting indefinitely.",
      },
    },
    {
      "@type": "Question",
      name: "Are containers automatically immutable?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. A container image is immutable, but a running container is not — processes inside it can write to the filesystem unless you stop them. Getting the real benefit requires a read-only root filesystem, no exec-based hotfixes in production, and pinning to digests rather than mutable tags.",
      },
    },
    {
      "@type": "Question",
      name: "What are the downsides of immutable infrastructure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The build pipeline becomes critical path, so a broken pipeline blocks emergency fixes. Debugging is harder when you cannot poke at a live host. Stateful components need externalised storage, which is real design work. And rebuild-based patching only helps if rebuild cadence is fast enough to matter.",
      },
    },
    {
      "@type": "Question",
      name: "How does patching work without in-place updates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You update the base image or package pin in source, rebuild the artifact, scan it, and roll it out through your normal deployment path. Patching becomes a code change with the same review, testing and rollback story as any other change, rather than a separate manual operation on live hosts.",
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
          <div className="text-xs uppercase tracking-wide muted">Architecture</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Immutable Infrastructure: Why Rebuilds Beat Patching
          </h1>
          <p className="text-sm muted">Published November 14, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Immutable infrastructure is the practice of never modifying a running system in place. If
            something needs to change &mdash; a package upgrade, a config value, a new release &mdash;
            you build a fresh artifact and replace what is running. It is an operational idea first and
            a security idea second, but the security consequences are large enough that it changes how
            vulnerability management works. Here is what it means concretely, what it genuinely buys
            you, and what it costs.
          </p>
        </header>

        <img
          src="/blog/immutable-infrastructure.jpg"
          alt="Immutable infrastructure replacing an identical server instance rather than patching it"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The idea, stated plainly</h2>
          <p className="text-sm muted">
            In the mutable model, a server is a long-lived thing you maintain. You provision it once,
            then apply changes over its lifetime: package updates, config edits, occasional manual
            fixes at three in the morning. Configuration management tools were invented to make that
            maintenance repeatable, and they did &mdash; but the server&apos;s state is still the
            accumulated result of every operation ever applied to it, in the order they happened.
          </p>
          <p className="text-sm muted">
            In the immutable model, the deployed artifact is built once from source and never touched
            again. Its state is a pure function of the build inputs. Two instances built from the same
            commit are identical, and an instance that has been running for six months is identical to
            one started this morning. When you need a change, you change the source, build a new
            artifact, deploy it, and destroy the old one. The older literature called these{" "}
            <em>phoenix servers</em> versus <em>snowflake servers</em>, and the metaphor still lands:
            snowflakes are unique and impossible to recreate; phoenixes burn down and come back
            identical.
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 660 250"
                role="img"
                aria-label="Two lifecycle rows compared: a mutable server accumulating patches and manual fixes over time versus an immutable pipeline that rebuilds and replaces instances from source"
                className="w-full"
                style={{ minWidth: 560 }}
              >
                <defs>
                  <marker id="ii-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>
                <text x={14} y={26} fontSize="12" fontWeight="600" fill="currentColor">
                  Mutable
                </text>
                {[
                  { x: 120, l: "provision" },
                  { x: 250, l: "patch" },
                  { x: 380, l: "hotfix" },
                  { x: 510, l: "drift" },
                ].map((s, i) => (
                  <g key={s.l}>
                    <rect
                      x={s.x}
                      y={10}
                      width={104}
                      height={34}
                      rx={6}
                      fill="currentColor"
                      fillOpacity={0.03 + i * 0.02}
                      stroke="currentColor"
                      strokeOpacity={0.35}
                      strokeDasharray={i === 3 ? "4 3" : undefined}
                    />
                    <text x={s.x + 52} y={32} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.8}>
                      {s.l}
                    </text>
                    {i < 3 && (
                      <line
                        x1={s.x + 104}
                        y1={27}
                        x2={s.x + 126}
                        y2={27}
                        stroke="currentColor"
                        strokeWidth={1.6}
                        markerEnd="url(#ii-arrow)"
                      />
                    )}
                  </g>
                ))}
                <text x={14} y={70} fontSize="10" fill="currentColor" fillOpacity={0.55}>
                  one long-lived
                </text>
                <text x={14} y={83} fontSize="10" fill="currentColor" fillOpacity={0.55}>
                  instance
                </text>

                <line x1={14} y1={104} x2={646} y2={104} stroke="currentColor" strokeOpacity={0.15} />

                <text x={14} y={140} fontSize="12" fontWeight="600" fill="currentColor">
                  Immutable
                </text>
                {[
                  { x: 120, l: "source change" },
                  { x: 250, l: "build" },
                  { x: 380, l: "scan" },
                  { x: 510, l: "replace" },
                ].map((s, i) => (
                  <g key={s.l}>
                    <rect
                      x={s.x}
                      y={124}
                      width={104}
                      height={34}
                      rx={6}
                      fill="var(--dg-accent,#2563eb)"
                      fillOpacity={0.12}
                      stroke="currentColor"
                      strokeOpacity={0.45}
                    />
                    <text x={s.x + 52} y={146} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.85}>
                      {s.l}
                    </text>
                    {i < 3 && (
                      <line
                        x1={s.x + 104}
                        y1={141}
                        x2={s.x + 126}
                        y2={141}
                        stroke="currentColor"
                        strokeWidth={1.6}
                        markerEnd="url(#ii-arrow)"
                      />
                    )}
                  </g>
                ))}
                <path
                  d="M562 158 L562 190 L172 190 L172 162"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeOpacity={0.5}
                  markerEnd="url(#ii-arrow)"
                />
                <text x={366} y={208} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                  every change re-enters at the top; instances are disposable
                </text>
                <text x={14} y={172} fontSize="10" fill="currentColor" fillOpacity={0.55}>
                  many short
                </text>
                <text x={14} y={185} fontSize="10" fill="currentColor" fillOpacity={0.55}>
                  -lived instances
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              The two lifecycles side by side. In the mutable row, state accumulates and drift is the
              endpoint; in the immutable row, every change re-enters through build and scan. Positions
              are structural, not to scale in time.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What immutability actually buys you
          </h2>
          <p className="text-sm muted">
            <strong>Drift disappears.</strong> This is the big one for security work. In a mutable
            fleet, a scan result is a claim about one host at one moment; the host next to it may have
            missed an update, and the one you scanned last quarter has certainly changed since. With
            immutable artifacts, scanning the image is scanning production, because production is a set
            of processes started from exactly that image. The scan result stays true until you deploy
            something else.
          </p>
          <p className="text-sm muted">
            <strong>Provenance becomes tractable.</strong> Every running instance traces back to a
            build, and a build traces back to a commit and a set of inputs. That is the foundation
            everything in{" "}
            <Link href="/blog/software-provenance" className="underline">
              software provenance
            </Link>{" "}
            and supply-chain attestation is built on &mdash; you cannot meaningfully attest to a host
            that has been hand-edited.
          </p>
          <p className="text-sm muted">
            <strong>Persistence gets harder for an attacker.</strong> A backdoor written to the
            filesystem of a container that gets replaced on the next deploy has a lifetime measured in
            hours or days. It does not make compromise impossible, and an attacker who can influence
            the build pipeline defeats the property entirely, but it raises the cost of quiet long-term
            residence considerably.
          </p>
          <p className="text-sm muted">
            <strong>Rollback becomes real.</strong> Because the previous artifact still exists,
            reverting is deploying the old digest. In a mutable world, &ldquo;undo the patch&rdquo; is
            frequently not a thing you can actually do.
          </p>
        </section>

        <img
          src="/blog/immutable-infrastructure-2.jpg"
          alt="Comparison of a drifted mutable server against a uniform immutable artifact stack"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Containers are not immutability on their own
          </h2>
          <p className="text-sm muted">
            The most common misconception is that adopting containers means you have adopted immutable
            infrastructure. A container <em>image</em> is immutable; a running container is not.
            Processes inside it can write anywhere they have permission to, and plenty of teams ship
            containers whose startup scripts install packages, or whose operators fix production by
            exec-ing in. Three things close that gap:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`# 1. Pin to a digest, not a moving tag
FROM debian:12-slim@sha256:<digest>

# 2. Make the root filesystem read-only at runtime (Kubernetes)
securityContext:
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  allowPrivilegeEscalation: false
volumeMounts:
  - name: scratch
    mountPath: /tmp
volumes:
  - name: scratch
    emptyDir: {}`}</code>
          </pre>
          <p className="text-sm muted">
            The third is cultural rather than technical: no fixing production by hand. If a change is
            worth making, it is worth making in source and rolling out. That rule is what keeps the
            first two from eroding, and it is usually the hardest of the three to hold on to during an
            incident. The runtime side of enforcement &mdash; noticing when something writes where it
            should not &mdash; is covered in{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              container runtime security
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Digest pinning deserves particular attention because it is the difference between
            &ldquo;we deploy the image we tested&rdquo; and &ldquo;we deploy whatever that tag points
            at today.&rdquo; It also creates an obligation: pinned images do not receive upstream
            security updates by definition, so pinning without a refresh process trades drift for rot.
            The mechanics of doing that well are in{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              automating base image updates
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The costs, honestly</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>The build pipeline becomes critical path.</strong> If rebuilding takes forty
              minutes, your fastest possible response to a zero-day is forty minutes plus rollout. If
              the pipeline is broken, you cannot ship an emergency fix at all. Pipeline reliability
              becomes a security control.
            </li>
            <li>
              <strong>Debugging changes shape.</strong> You cannot leave a broken instance running and
              poke at it if your platform replaces it automatically. Good logging, metrics and the
              ability to launch a debug copy of an exact artifact stop being nice-to-haves.
            </li>
            <li>
              <strong>State needs somewhere to live.</strong> Databases, caches, uploaded files and
              queues all need to be externalised from the disposable compute. This is genuine design
              work and the main reason partial adoption is so common.
            </li>
            <li>
              <strong>Rebuild cadence is the whole game.</strong> Immutability only patches things if
              you actually rebuild. A fleet of immutable images last built eight months ago is not
              safer than a patched mutable fleet &mdash; it is just more consistently out of date.
            </li>
          </ul>
          <p className="text-sm muted">
            That last point is worth sitting with. The security argument for immutable infrastructure
            is not &ldquo;rebuilding is inherently safer than patching.&rdquo; It is that rebuilding
            makes patching a normal, tested, reviewable, rollback-able code change instead of a
            separate manual process nobody enjoys. The safety comes from the frequency that
            normalisation enables. Our walkthrough of{" "}
            <Link href="/blog/how-to-patch-docker-base-image-vulnerabilities" className="underline">
              patching base image vulnerabilities
            </Link>{" "}
            assumes exactly this loop.
          </p>
        </section>

        <img
          src="/blog/immutable-infrastructure-3.jpg"
          alt="Build pipeline producing sealed identical artifacts with content-addressed digests"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A workable adoption path</h2>
          <p className="text-sm muted">
            Nobody flips a fleet to immutable in one change. What works is narrowing the mutable
            surface progressively: start with stateless services, where the design work is smallest.
            Move all configuration to environment variables or mounted config so images are
            environment-agnostic and the same digest promotes from staging to production unchanged.
            Turn on read-only root filesystems and fix whatever breaks &mdash; usually a temp
            directory, occasionally a library that insists on writing a cache. Then remove the ability
            to exec into production, and hold the line.
          </p>
          <p className="text-sm muted">
            Once that is in place, add a scheduled rebuild independent of feature work. Weekly is a
            reasonable default: it picks up base image security updates without waiting for someone to
            ship a feature, and it keeps the pipeline warm so it works when you need it urgently. Sign
            the artifacts if you want the provenance chain to be verifiable at deploy time &mdash;{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Sigstore and cosign
            </Link>{" "}
            are the usual tools &mdash; and reduce what is in the image in the first place, which is
            the argument for{" "}
            <Link href="/blog/migrating-to-distroless-images" className="underline">
              distroless base images
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Immutable infrastructure makes scanning dramatically more valuable, because the artifact
            you scan is the artifact that runs &mdash; there is no gap between the report and reality
            for drift to hide in. That is a genuine change in what a scan result means. ScanRook is
            built for that model: it scans a container image tarball, a compiled binary or a source
            archive, reads the actual package databases inside it rather than guessing from filenames,
            and matches everything against OSV, NVD and Red Hat OVAL in parallel with the source and a
            confidence tier attached to each finding.
          </p>
          <p className="text-sm muted">
            The practical pattern is to scan at build, before the digest is promoted, and to rescan
            the same digest on a schedule. The second half matters because an image does not change
            but the advisory data does &mdash; an artifact that was clean on Monday can have three new
            findings by Friday without a single byte moving. That rescan is what turns your rebuild
            cadence from a calendar habit into a signal-driven one, and it is the honest answer to the
            failure mode where immutable infrastructure quietly becomes immutably outdated.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is immutable infrastructure?</h3>
              <p className="text-sm muted mt-1">
                An operating model where deployed components are never modified in place. Changes mean
                building a new artifact from source and replacing what is running.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do containers make me immutable?</h3>
              <p className="text-sm muted mt-1">
                Not by themselves. You need digest pinning, a read-only root filesystem, and a rule
                against fixing production by hand.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the biggest downside?</h3>
              <p className="text-sm muted mt-1">
                The build pipeline becomes critical path for security response, and stateful
                components need real design work to externalise their storage.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does patching work?</h3>
              <p className="text-sm muted mt-1">
                Update the pin in source, rebuild, scan, roll out. Patching becomes an ordinary code
                change with the same review and rollback story as any other.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the digest you promote</h3>
          <p className="text-sm muted leading-relaxed">
            In an immutable pipeline the scan report describes production exactly. Scan your image with
            ScanRook at build time and again on a schedule &mdash; every finding carries its advisory
            source and confidence tier, so you can tell a new advisory from a new dependency.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              Automating Base Image Updates
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              Docker Image Hardening Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-provenance" className="underline">
              Software Provenance
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

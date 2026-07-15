import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-28";

const title = `Patch Management: A Practical Guide for Modern Stacks | ${APP_NAME}`;
const description =
  "Patch management is how you close known vulnerabilities. The lifecycle, prioritization, testing, and why containers are rebuilt instead of patched.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "patch management",
    "patch management process",
    "patch management lifecycle",
    "patch management best practices",
    "patch prioritization",
    "container patching",
    "patch tuesday",
    "os patch management",
    "vulnerability remediation",
    "base image updates",
  ],
  alternates: { canonical: "/blog/patch-management-guide" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/patch-management-guide",
    images: ["/blog/patch-management-guide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/patch-management-guide.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Patch Management: A Practical Guide for Modern Stacks",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/patch-management-guide",
  image: "https://scanrook.io/blog/patch-management-guide.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is patch management?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Patch management is the process of acquiring, testing, and deploying software updates that fix security vulnerabilities and bugs across operating systems, applications, dependencies, and firmware. It is the execution arm of remediation: a repeatable pipeline that takes a known fix and gets it safely into production without breaking things.",
      },
    },
    {
      "@type": "Question",
      name: "What are the steps in a patch management process?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A typical cycle is: inventory what you run, monitor vendor advisories and scan output for available patches, assess and prioritize by risk, test the patch in a staging environment, deploy it through a controlled rollout, verify it applied by re-scanning, and document the change. The loop repeats on a cadence and for emergency releases.",
      },
    },
    {
      "@type": "Question",
      name: "How do you patch a container?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You generally do not patch a running container in place. Containers are immutable, so the fix is to update the base image or dependency, rebuild the image with the pull flag so it fetches the latest layers, push the new image, and redeploy. Then re-scan the rebuilt image to confirm the vulnerable package is actually gone.",
      },
    },
    {
      "@type": "Question",
      name: "What is Patch Tuesday?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Patch Tuesday is the informal name for Microsoft's scheduled monthly release of security updates on the second Tuesday of each month. Many vendors align to a predictable cadence so teams can plan maintenance windows, but critical flaws still trigger out-of-band emergency patches released outside the normal schedule.",
      },
    },
    {
      "@type": "Question",
      name: "How is patch management different from vulnerability management?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vulnerability management is the broad lifecycle of finding, prioritizing, and tracking weaknesses to closure. Patch management is the mechanism that executes many of those fixes. Patching is one way to remediate; some vulnerabilities are closed by configuration changes or mitigations when no patch exists, so patch management sits inside the wider program.",
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
            Patch Management: A Practical Guide for Modern Stacks
          </h1>
          <p className="text-sm muted">Published July 28, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Knowing a vulnerability exists is only half the job. <strong>Patch management</strong> is
            the discipline of actually getting the fix into production &mdash; safely, on a schedule,
            and verifiably. This guide covers the patch management lifecycle, how to prioritize what to
            patch first, why containers change the model from patch-in-place to rebuild-and-redeploy,
            and how to confirm a patch really landed.
          </p>
        </header>

        <img
          src="/blog/patch-management-guide.jpg"
          alt="The patch management lifecycle from advisory monitoring to verification"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What patch management is</h2>
          <p className="text-sm muted">
            Patch management is the process of acquiring, testing, and deploying updates that fix
            security flaws and bugs across everything you run: operating systems, applications, the
            open-source dependencies your code pulls in, container base images, and firmware. If
            vulnerability management is the program that decides <em>what</em> needs fixing, patch
            management is the machinery that <em>does</em> the fixing &mdash; a repeatable pipeline
            from &ldquo;a fix exists&rdquo; to &ldquo;the fix is running in production.&rdquo;
          </p>
          <p className="text-sm muted">
            The reason it deserves its own process is that patching is where good intentions meet
            operational reality. A patch can break a dependency, require a restart, or need a
            maintenance window. Without a structured approach, urgent fixes get deferred and routine
            ones pile into an unmanageable backlog. A defined lifecycle keeps both moving.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The patch management lifecycle</h2>
          <p className="text-sm muted">
            The steps are consistent across frameworks even when the names differ:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>1. Inventory.</strong> Know what software and versions you run. You cannot patch what you have not catalogued.</li>
            <li><strong>2. Monitor.</strong> Watch vendor advisories, distribution security trackers, and your own scan output for available fixes.</li>
            <li><strong>3. Assess and prioritize.</strong> Not every patch is urgent. Rank by real risk before scheduling work.</li>
            <li><strong>4. Test.</strong> Apply the patch in staging first to catch regressions and compatibility breaks.</li>
            <li><strong>5. Deploy.</strong> Roll out through a controlled process &mdash; canary or staged &mdash; rather than all at once.</li>
            <li><strong>6. Verify.</strong> Re-scan or check versions to confirm the patch actually applied everywhere it should have.</li>
            <li><strong>7. Document.</strong> Record what changed, when, and why, for audit and for the next incident.</li>
          </ul>
          <p className="text-sm muted">
            This loop runs on a cadence for routine updates and on demand for emergencies, which is
            the distinction the next section addresses.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scheduled vs emergency patches</h2>
          <p className="text-sm muted">
            Much of patching is predictable. Many vendors ship on a regular cadence &mdash;
            Microsoft&apos;s <strong>Patch Tuesday</strong>, the second Tuesday of each month, is the
            best-known example &mdash; so teams can plan maintenance windows around a known rhythm.
            Predictability is a feature: it lets you batch testing and reduce the disruption of
            frequent restarts.
          </p>
          <p className="text-sm muted">
            But a critical, actively exploited flaw does not wait for the calendar. Those trigger
            <strong> out-of-band</strong> emergency patches, released outside the normal schedule, and
            your process needs a fast lane for them: abbreviated testing, an expedited change approval,
            and a rollback plan. The signal that a flaw belongs in that fast lane usually comes from
            exploitation data &mdash; a CVE landing in the{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA Known Exploited Vulnerabilities catalog
            </Link>{" "}
            is a strong cue to skip the queue.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Prioritizing what to patch first</h2>
          <p className="text-sm muted">
            You will never patch everything at once, so patching order is a risk decision. The same
            signals that drive vulnerability triage apply here: severity as a baseline, but weighted
            by exploit probability and real exposure. A patch that closes a flaw with a high{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              EPSS exploit-probability score
            </Link>{" "}
            on an internet-facing service outranks a higher-severity patch for something isolated and
            unreachable. Asset criticality, whether the vulnerable path is actually used, and any
            compensating controls all feed the order.
          </p>
          <p className="text-sm muted">
            Sometimes there is simply no patch to apply &mdash; the maintainer has not shipped a fix,
            or the fix would break you. That is not a dead end; it is a case for a documented
            mitigation and an accepted-risk decision, which we cover in{" "}
            <Link href="/blog/epss-scores-explained" className="underline">
              prioritize vulnerabilities with EPSS
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Containers change the model</h2>
          <p className="text-sm muted">
            Traditional patch management updates a running system in place with a package manager. For
            containers, that instinct is wrong. Container images are <em>immutable</em>: patching a
            live container is throwaway work that vanishes on the next deploy and leaves your image
            definition still vulnerable. The correct model is rebuild-and-redeploy &mdash; you fix the
            recipe, not the running instance.
          </p>
          <p className="text-sm muted">
            In practice that means updating the base image tag or dependency, rebuilding with a fresh
            pull so you actually pick up the patched layers, and redeploying the new image:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# rebuild WITHOUT the cache so updated base layers are pulled
docker build --pull --no-cache -t registry.example.com/app:1.4.2 .

# push the rebuilt image and roll it out
docker push registry.example.com/app:1.4.2
kubectl set image deployment/app app=registry.example.com/app:1.4.2`}</pre>
          <p className="text-sm muted">
            The <code>--pull</code> flag matters: without it, a cached base layer can silently keep an
            old, vulnerable version around even though the upstream tag has been patched. Our step-by-step
            guide to{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              reducing CVEs in Docker images
            </Link>{" "}
            covers the full workflow, and{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              automating base image updates
            </Link>{" "}
            shows how to make the rebuild happen on a schedule rather than by memory.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying a patch actually landed</h2>
          <p className="text-sm muted">
            The step teams skip most often is verification. Deploying a patch and assuming it worked is
            how a &ldquo;fixed&rdquo; CVE reappears in the next audit. A cached layer, a pinned
            transitive dependency, or a rollout that only reached part of the fleet can all leave the
            vulnerable version running. The fix is to close the loop: re-scan the rebuilt artifact and
            confirm the package version moved. This is exactly the verification stage of the wider
            remediation cycle, and it is where an artifact scanner earns its place.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook sits at both ends of the patch loop. Before you patch, it tells you what needs
            patching: it reads the packages actually installed in a container image, source tree, or
            binary &mdash; not a guess from filenames &mdash; and cross-references each against OSV,
            NVD, and Red Hat OVAL, with EPSS and KEV signals attached so you can order the work by real
            risk. Because it reads installed state, it also understands backported fixes, so it will
            not flag a Red Hat package as vulnerable when the distribution has already patched it
            behind an unchanged version number, a nuance we explain in{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>
            .
          </p>
          <p className="text-sm muted">
            After you patch, re-running ScanRook against the rebuilt image is the verification step:
            the package that was flagged should be gone, and if it is not, you learn that immediately
            rather than at the next review. That before-and-after loop &mdash; scan, rebuild, scan
            again &mdash; is what turns patch management from a hopeful deploy into a confirmed fix.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is patch management?</h3>
              <p className="text-sm muted mt-1">
                The process of acquiring, testing, and deploying updates that fix vulnerabilities and
                bugs across operating systems, applications, dependencies, and firmware.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are the steps?</h3>
              <p className="text-sm muted mt-1">
                Inventory, monitor advisories, assess and prioritize, test in staging, deploy through a
                controlled rollout, verify by re-scanning, and document the change.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do you patch a container?</h3>
              <p className="text-sm muted mt-1">
                Not in place. Update the base image or dependency, rebuild with <code>--pull</code>,
                push, redeploy, and re-scan the new image to confirm the fix.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Patch vs vulnerability management?</h3>
              <p className="text-sm muted mt-1">
                Vulnerability management is the broad lifecycle; patch management is the mechanism that
                executes many of the fixes inside it.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Confirm the patch actually landed</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads installed package state to tell you what needs patching, orders it by EPSS
            and KEV, and re-scans the rebuilt image so you can prove the vulnerable version is gone
            &mdash; not just assume it.
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
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              Automate Docker Base Image Updates
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS Scores Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

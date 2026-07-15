import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-16";

const title = `CIS Benchmarks Explained: Docker and Kubernetes Hardening | ${APP_NAME}`;
const description =
  "What CIS Benchmarks are: how the consensus hardening guides work, the Docker and Kubernetes benchmarks, kube-bench and Docker Bench, and where scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cis benchmark",
    "cis benchmarks",
    "cis docker benchmark",
    "cis kubernetes benchmark",
    "cis benchmarks explained",
    "cis hardening",
    "docker bench for security",
    "cis controls vs benchmarks",
    "container hardening",
    "cis benchmark levels",
  ],
  alternates: { canonical: "/blog/cis-benchmarks-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cis-benchmarks-explained",
    images: ["/blog/cis-benchmarks-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/cis-benchmarks-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "CIS Benchmarks Explained: Docker and Kubernetes Hardening",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cis-benchmarks-explained",
  image: "https://scanrook.io/blog/cis-benchmarks-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a CIS Benchmark?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A CIS Benchmark is a consensus-developed set of secure configuration recommendations for a specific technology, published by the Center for Internet Security. There are benchmarks for operating systems, cloud platforms, containers, Kubernetes, databases, browsers, and more. Each recommendation includes a rationale, an audit procedure to check it, and remediation steps to bring a system into line.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between CIS Level 1 and Level 2?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Level 1 recommendations are practical baseline settings that improve security with minimal impact on functionality, intended to be broadly applicable. Level 2 recommendations provide defense in depth for higher-security environments and may reduce usability or performance. Most teams start at Level 1 and adopt Level 2 controls selectively where the extra hardening is justified.",
      },
    },
    {
      "@type": "Question",
      name: "What is the CIS Docker Benchmark?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The CIS Docker Benchmark is a set of hardening recommendations for Docker host configuration, the Docker daemon, container images, and container runtime settings. The open-source Docker Bench for Security script automates many of its checks, reporting which recommendations a host passes or fails so you can remediate the gaps.",
      },
    },
    {
      "@type": "Question",
      name: "How do CIS Benchmarks relate to vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They address different questions. CIS Benchmarks check whether a system is configured securely; vulnerability scanning checks whether the software running on it has known CVEs. A container can pass every CIS check and still ship a critically vulnerable library, and vice versa, so the two are complementary layers of a hardening program rather than substitutes.",
      },
    },
    {
      "@type": "Question",
      name: "Are CIS Benchmarks free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The CIS Benchmark PDFs are freely available to download after registering with the Center for Internet Security. CIS also offers paid resources such as CIS Hardened Images and membership tooling, but the benchmark documents themselves are free to read and implement.",
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
            CIS Benchmarks Explained: Docker and Kubernetes Hardening
          </h1>
          <p className="text-sm muted">Published July 12, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            If an auditor or a hardening guide has ever pointed you at &ldquo;the CIS
            Benchmark,&rdquo; the natural first question is what that actually is and how binding it
            is. A CIS Benchmark is a consensus recipe for configuring a technology securely &mdash;
            and for containers and Kubernetes, it is one of the most widely referenced baselines in
            the industry. Here is how they work and where they fit.
          </p>
        </header>

        <img
          src="/blog/cis-benchmarks-explained.jpg"
          alt="CIS Benchmarks explained for Docker and Kubernetes"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What CIS Benchmarks are</h2>
          <p className="text-sm muted">
            The <strong>Center for Internet Security (CIS)</strong> is a nonprofit that publishes
            security best practices. Its <strong>Benchmarks</strong> are configuration guides:
            detailed, prescriptive recommendations for how to securely set up a specific technology.
            There are well over a hundred of them, covering operating systems (Linux distributions,
            Windows), cloud platforms (AWS, Azure, Google Cloud), containers and orchestration
            (Docker, Kubernetes), databases, web servers, network devices, and even browsers.
          </p>
          <p className="text-sm muted">
            The distinguishing feature is <em>how</em> they are made. Benchmarks are developed by
            community consensus &mdash; volunteers, vendors, and practitioners debate and agree on
            each recommendation &mdash; rather than handed down by a single authority. That process
            is slower but produces guidance that a broad cross-section of the industry can stand
            behind, which is a large part of why auditors and frameworks reference them.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Anatomy of a benchmark</h2>
          <p className="text-sm muted">
            Open any CIS Benchmark and you find a long list of recommendations, each structured the
            same way. Every recommendation carries a <strong>description</strong> of the setting, a{" "}
            <strong>rationale</strong> explaining why it matters, an <strong>audit</strong>{" "}
            procedure &mdash; often an exact command &mdash; to check whether a system complies, and{" "}
            <strong>remediation</strong> steps to fix it if it does not. That structure is what
            makes benchmarks automatable: the audit steps can be scripted.
          </p>
          <p className="text-sm muted">
            Recommendations are split into two <strong>profile levels</strong>:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Level 1</strong> is the practical baseline &mdash; settings that meaningfully
              improve security while keeping impact on functionality low. These are meant to be
              broadly applicable to almost any deployment.
            </li>
            <li>
              <strong>Level 2</strong> is defense in depth for higher-security environments. These
              controls are stricter and may cost usability or performance, so they are adopted more
              selectively where the extra assurance is worth it.
            </li>
          </ul>
          <p className="text-sm muted">
            Container and Kubernetes benchmarks also group recommendations by <em>scope</em> &mdash;
            for Docker, that means separate sections for host configuration, the daemon, container
            images and build files, and container runtime. You can tackle them area by area rather
            than as one monolithic checklist.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CIS Docker Benchmark</h2>
          <p className="text-sm muted">
            The CIS Docker Benchmark is the go-to hardening reference for Docker deployments. Its
            recommendations span the whole stack: securing the host the daemon runs on, locking down
            the daemon&apos;s configuration, hardening how images are built, and constraining
            containers at runtime &mdash; running as a non-root user, dropping unnecessary Linux
            capabilities, setting resource limits, avoiding privileged mode, and mounting the root
            filesystem read-only where possible.
          </p>
          <p className="text-sm muted">
            You do not have to check all of that by hand. <strong>Docker Bench for Security</strong>,
            an open-source script originally from Docker, automates a large share of the benchmark:
            it runs against a host and reports which recommendations pass, warn, or fail. It is the
            fastest way to get a first read on how far a Docker host is from the CIS baseline. Many
            of the same runtime controls show up in our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>{" "}
            and{" "}
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              image hardening checklist
            </Link>
            , which translate the benchmark ideas into concrete steps with code.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CIS Kubernetes Benchmark</h2>
          <p className="text-sm muted">
            Kubernetes has its own benchmark, aimed at the components that make up a cluster: the API
            server, controller manager, scheduler, etcd datastore, kubelet on each node, and the
            policies that govern workloads. Recommendations cover things like restricting anonymous
            access to the API server, enabling audit logging, securing etcd, setting appropriate file
            permissions on control-plane configs, and applying least-privilege RBAC.
          </p>
          <p className="text-sm muted">
            The open-source tool most teams use to check a cluster against it is{" "}
            <strong>kube-bench</strong>, maintained by Aqua Security. It runs the benchmark&apos;s
            audit checks against a running cluster and reports pass/fail per recommendation, with the
            remediation text inline. As with Docker, the benchmark is the standard and the tool
            automates measuring against it. Cluster configuration hardening sits alongside image
            security &mdash; our guide to{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning
            </Link>{" "}
            covers the image side that the CIS benchmark does not.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Benchmarks vs Controls vs vulnerability scanning
          </h2>
          <p className="text-sm muted">
            Three ideas get muddled here, and keeping them separate clarifies a lot:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Thing</th>
                  <th className="text-left py-2 pr-4 font-semibold">Question it answers</th>
                  <th className="text-left py-2 font-semibold">Scope</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>CIS Benchmarks</strong></td>
                  <td className="py-2 pr-4 align-top">Is this system configured securely?</td>
                  <td className="py-2 align-top">Per-technology config hardening</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>CIS Controls</strong></td>
                  <td className="py-2 pr-4 align-top">What safeguards should my program have?</td>
                  <td className="py-2 align-top">18 broad, prioritized safeguards</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Vulnerability scanning</strong></td>
                  <td className="py-2 pr-4 align-top">Does my software have known CVEs?</td>
                  <td className="py-2 align-top">Known flaws in the components you run</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The <strong>CIS Controls</strong> (currently 18 of them) are a broad, prioritized set of
            safeguards for a security program as a whole &mdash; a different, higher-level artifact
            from the technology-specific Benchmarks, though both come from CIS. And neither is the
            same as vulnerability scanning: a host can pass every CIS Docker check and still run a
            container with a critical CVE in it, because configuration and known-vulnerability
            content are orthogonal.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How CIS fits a compliance program
          </h2>
          <p className="text-sm muted">
            CIS Benchmarks are widely referenced by and mapped to other frameworks &mdash; PCI DSS,
            HIPAA, NIST, and ISO 27001 among them &mdash; so implementing a benchmark often satisfies
            configuration-hardening requirements those frameworks impose. CIS also publishes{" "}
            <strong>Hardened Images</strong>: cloud VM images pre-configured to a benchmark, which
            can shortcut the work of building a compliant base. Whether any of this satisfies a
            specific obligation is a question for your auditor and, where the stakes are legal, your
            counsel; the broader compliance picture for scanning is covered in our{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where scanning fits alongside</h2>
          <p className="text-sm muted">
            To be clear about what ScanRook is and is not: it is a vulnerability scanner, not a CIS
            Benchmark tool. If you want to measure a Docker host or a Kubernetes cluster against the
            CIS baseline, Docker Bench for Security and kube-bench are the right tools for that job.
            ScanRook answers the other half of the question &mdash; whether the images you run
            contain known-vulnerable packages &mdash; by reading the real installed state of an
            artifact and matching it against OSV, NVD, and vendor advisory data.
          </p>
          <p className="text-sm muted">
            The two belong together. Notably, the CIS Docker Benchmark itself recommends scanning
            images for vulnerabilities as part of a hardened build, so running a scanner is not
            adjacent to CIS compliance &mdash; it is part of it. Harden the configuration with the
            benchmark tools, scan the content for CVEs, and you have covered both axes instead of
            mistaking one for the whole.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Who maintains the CIS Benchmarks?</h3>
              <p className="text-sm muted mt-1">
                The Center for Internet Security, a nonprofit, coordinates them &mdash; but the
                content is developed by community consensus among volunteers, vendors, and
                practitioners.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What tool checks the CIS Docker Benchmark?</h3>
              <p className="text-sm muted mt-1">
                Docker Bench for Security, an open-source script, automates many of the benchmark
                checks against a Docker host and reports pass, warn, or fail per recommendation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does passing a CIS Benchmark mean I am secure?</h3>
              <p className="text-sm muted mt-1">
                It means you are configured to a recognized baseline. It does not address known
                vulnerabilities in the software you run, which is a separate check that scanning
                covers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Are CIS Benchmarks and CIS Controls the same?</h3>
              <p className="text-sm muted mt-1">
                No. Benchmarks are technology-specific configuration guides; the CIS Controls are a
                broader, prioritized set of 18 safeguards for a whole security program.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the content, not just the config</h3>
          <p className="text-sm muted leading-relaxed">
            CIS Benchmarks harden how your containers are configured; the CIS Docker Benchmark also
            tells you to scan them. ScanRook reads the real installed state of your images and
            matches every package against OSV, NVD, and vendor advisory data, so a benchmark-passing
            host does not quietly ship a critical CVE.
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
              Container Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Compliance Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

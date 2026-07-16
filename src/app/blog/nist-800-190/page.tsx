import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-11";

const title = `NIST 800-190 Explained: The Container Security Guide | ${APP_NAME}`;
const description =
  "NIST 800-190 is NIST's container security guide. The image, registry, orchestrator, container, and host risks it covers, and how to apply its countermeasures.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "nist 800-190",
    "nist sp 800-190",
    "nist 800-190 explained",
    "application container security guide",
    "container security nist",
    "nist container security",
    "nist 800-190 checklist",
    "container image security standard",
    "nist 800-190 countermeasures",
    "container compliance",
  ],
  alternates: { canonical: "/blog/nist-800-190" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/nist-800-190",
    images: ["/blog/nist-800-190.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/nist-800-190.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "NIST 800-190 Explained: The Container Security Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/nist-800-190",
  image: "https://scanrook.io/blog/nist-800-190.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is NIST 800-190?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NIST Special Publication 800-190, the Application Container Security Guide, is a NIST document published in September 2017 that explains the security risks of the container ecosystem and recommends countermeasures. It organizes risks and mitigations across five areas: images, registries, orchestrators, containers, and the host operating system.",
      },
    },
    {
      "@type": "Question",
      name: "Is NIST 800-190 a mandatory standard?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. NIST 800-190 is guidance, not a certifiable or independently auditable standard on its own. It is widely referenced because its controls map to frameworks that can be mandatory, such as NIST 800-53 and FedRAMP. Whether it applies to you depends on your regulatory context, which is a question for your compliance team or counsel.",
      },
    },
    {
      "@type": "Question",
      name: "What are the five risk areas in NIST 800-190?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The guide groups container risks into image risks (vulnerabilities, misconfiguration, embedded secrets, untrusted images), registry risks (insecure connections, stale images, weak authentication), orchestrator risks (excessive admin access, poor network separation, mixed workload sensitivity), container runtime risks (runtime and application vulnerabilities, unbounded network access), and host OS risks (large attack surface, shared kernel, improper access).",
      },
    },
    {
      "@type": "Question",
      name: "Does NIST 800-190 require vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It strongly recommends it. Among the image countermeasures, the guide calls for continuously scanning images for vulnerabilities, keeping a pipeline that rebuilds and re-validates images, and detecting embedded secrets and malware. Image scanning is one of the most concrete practices the document asks organizations to adopt.",
      },
    },
    {
      "@type": "Question",
      name: "How is NIST 800-190 different from CIS Benchmarks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NIST 800-190 is a risk framework that describes what can go wrong across the container ecosystem and what categories of countermeasure to apply. CIS Benchmarks are prescriptive, checkable configuration settings for specific software like Docker and Kubernetes. They complement each other: 800-190 tells you what to worry about, CIS tells you the exact setting to apply.",
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
            NIST 800-190 Explained: The Container Security Guide
          </h1>
          <p className="text-sm muted">Published December 11, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            When a security questionnaire or audit asks how you secure containers, the reference it
            usually leans on is NIST 800-190. It is the most widely cited government guidance on
            container security, and despite its age it still maps cleanly onto how teams build and
            ship images today. Here is what NIST 800-190 actually says, the five risk areas it is
            organized around, and how to turn it into practice.
          </p>
        </header>

        <img
          src="/blog/nist-800-190.jpg"
          alt="NIST 800-190 container security risk areas"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What NIST 800-190 is</h2>
          <p className="text-sm muted">
            NIST Special Publication 800-190, titled the <em>Application Container Security Guide</em>,
            was published by the National Institute of Standards and Technology in September 2017. Its
            purpose is straightforward: explain the security implications of container technologies
            &mdash; images, registries, orchestrators, and runtimes &mdash; and give practical
            countermeasures. It is written to be technology-neutral, so it talks about the container
            ecosystem in general rather than a single product.
          </p>
          <p className="text-sm muted">
            Importantly, 800-190 is <strong>guidance, not a pass/fail standard</strong>. You do not
            get certified against it directly. Its influence comes from being referenced by frameworks
            that <em>are</em> enforceable &mdash; its recommendations map to controls in NIST 800-53
            and feed into programs like FedRAMP. If a contract obligates you to it, treat the specific
            wording as a compliance question and consult counsel; the document itself is a security
            playbook rather than a legal checklist.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The five risk areas</h2>
          <p className="text-sm muted">
            The most useful thing about 800-190 is its structure. It breaks the container attack
            surface into five layers and enumerates the major risks at each. If you internalize this
            map, you have a durable mental model for where container problems come from.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 300" role="img" aria-label="NIST 800-190 five container risk areas: image, registry, orchestrator, container, host OS" className="w-full min-w-[560px]">
              <text x="360" y="20" fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle" opacity="0.85">
                NIST 800-190 container risk areas
              </text>
              <g>
                <rect x="10" y="34" width="700" height="44" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" />
                <rect x="10" y="86" width="700" height="44" rx="8" fill="none" stroke="currentColor" opacity="0.4" />
                <rect x="10" y="138" width="700" height="44" rx="8" fill="none" stroke="currentColor" opacity="0.4" />
                <rect x="10" y="190" width="700" height="44" rx="8" fill="none" stroke="currentColor" opacity="0.4" />
                <rect x="10" y="242" width="700" height="44" rx="8" fill="none" stroke="currentColor" opacity="0.4" />
              </g>
              <g fill="currentColor">
                <text x="28" y="61" fontSize="14" fontWeight="600">Images</text>
                <text x="200" y="61" fontSize="12" opacity="0.7">vulnerabilities, misconfig, embedded secrets, untrusted sources</text>
                <text x="28" y="113" fontSize="14" fontWeight="600">Registries</text>
                <text x="200" y="113" fontSize="12" opacity="0.7">insecure connections, stale images, weak authentication</text>
                <text x="28" y="165" fontSize="14" fontWeight="600">Orchestrator</text>
                <text x="200" y="165" fontSize="12" opacity="0.7">excessive admin access, poor network separation, mixed sensitivity</text>
                <text x="28" y="217" fontSize="14" fontWeight="600">Containers</text>
                <text x="200" y="217" fontSize="12" opacity="0.7">runtime and app vulnerabilities, unbounded network access</text>
                <text x="28" y="269" fontSize="14" fontWeight="600">Host OS</text>
                <text x="200" y="269" fontSize="12" opacity="0.7">large attack surface, shared kernel, improper access rights</text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            The highlighted <strong>image</strong> layer is where most day-to-day work happens. It
            covers image vulnerabilities, configuration defects (running as root, unnecessary
            packages), embedded clear-text secrets, embedded malware, and the use of untrusted base
            images. Everything above it &mdash; registries, orchestrators, runtimes, and the host
            &mdash; is about how those images are stored, scheduled, isolated, and run.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The countermeasures it recommends</h2>
          <p className="text-sm muted">
            For each risk area, 800-190 pairs the risks with countermeasures. The recurring themes are
            worth memorizing because they show up in almost every container hardening guide since:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Images:</strong> scan continuously for vulnerabilities, enforce a pipeline that
              rebuilds and re-validates, detect embedded secrets and malware, and prefer minimal,
              trusted base images. This is the layer{" "}
              <Link href="/blog/container-image-scanning-guide" className="underline">
                image scanning
              </Link>{" "}
              directly addresses.
            </li>
            <li>
              <strong>Registries:</strong> require encrypted connections, authenticate access, and
              prune stale images so old, vulnerable versions cannot be pulled by accident.
            </li>
            <li>
              <strong>Orchestrators:</strong> use least-privilege administrative access, isolate
              network traffic between workloads, and avoid mixing workloads of different sensitivity
              levels on the same nodes.
            </li>
            <li>
              <strong>Containers:</strong> constrain runtime privileges and network access, run
              application-aware controls, and keep the runtime itself patched.
            </li>
            <li>
              <strong>Host OS:</strong> use a minimal, container-specific host operating system,
              reduce its attack surface, and keep users off the shared kernel with proper access
              controls.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How it fits with other frameworks</h2>
          <p className="text-sm muted">
            800-190 does not exist in isolation. It sits alongside{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks
            </Link>{" "}
            (prescriptive, checkable configuration for Docker and Kubernetes) and higher-level control
            catalogs like NIST 800-53. The clean way to think about it: 800-190 tells you <em>what</em>{" "}
            categories of risk exist and <em>what kind</em> of countermeasure to apply; CIS Benchmarks
            tell you the <em>exact setting</em> to flip; and your auditable framework (800-53, FedRAMP,
            SOC 2 mapped to it) tells you what you must be able to <em>prove</em>. For where scanning
            fits inside a broader obligation, see our{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Scan every image for known vulnerabilities before it is promoted, and re-scan on a cadence as new advisories publish.</li>
            <li>Maintain an inventory of what is inside each image &mdash; an SBOM &mdash; so you can answer where a newly disclosed CVE lives.</li>
            <li>Fail the build on embedded clear-text secrets; never ship credentials in a layer.</li>
            <li>Use minimal, trusted base images and rebuild regularly rather than letting images age.</li>
            <li>Require authenticated, encrypted registry access and prune stale image tags.</li>
            <li>Run containers as non-root with least privilege, and isolate network traffic between workloads.</li>
            <li>Use a minimal host OS dedicated to running containers, and keep the runtime patched.</li>
            <li>Document how each control is implemented, and consult counsel on which are contractually required.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            800-190 asks for concrete things at the image layer &mdash; continuous vulnerability
            scanning, embedded-secret detection, and knowing what is inside an image &mdash; and that
            is exactly the scope ScanRook covers. It scans the built artifact: container images,
            binaries, and archives. It matches every installed package against multiple advisory
            sources, flags secrets baked into layers, and produces an{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              SBOM
            </Link>{" "}
            you can attach as evidence. To be clear about the boundary: ScanRook addresses the image
            countermeasures, not the orchestrator, host-OS, or registry-configuration controls &mdash;
            those need cluster and infrastructure tooling. Used together with{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              cluster scanning
            </Link>{" "}
            and a hardened host, image scanning closes the layer where most container CVEs actually
            live.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">When was NIST 800-190 published?</h3>
              <p className="text-sm muted mt-1">
                In September 2017. It has not been formally superseded, and its risk model has aged
                well because the container ecosystem it describes &mdash; images, registries,
                orchestrators, runtimes, hosts &mdash; is structurally the same today.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is NIST 800-190 mandatory?</h3>
              <p className="text-sm muted mt-1">
                Not by itself. It is guidance. It becomes effectively required when a contract or
                framework you are bound to references it, so whether it applies to you is a compliance
                and legal question rather than a technical one.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does 800-190 cover Kubernetes?</h3>
              <p className="text-sm muted mt-1">
                Yes, under its orchestrator risk area. It discusses orchestrator concerns like
                administrative access, network separation, and workload sensitivity generically, which
                map directly onto Kubernetes clusters.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the fastest way to start complying?</h3>
              <p className="text-sm muted mt-1">
                Begin at the image layer: scan every image for vulnerabilities and secrets, generate an
                SBOM, and use minimal trusted base images. Those are the most concrete, highest-leverage
                countermeasures the document asks for.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the image-layer controls in 800-190</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook scans your images for known vulnerabilities and embedded secrets and produces an
            SBOM you can attach as audit evidence &mdash; the concrete, checkable countermeasures NIST
            800-190 asks for at the image layer.
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
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks Explained
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

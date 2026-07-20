import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-17";

const title = `AWS GuardDuty: What It Detects and What It Misses | ${APP_NAME}`;
const description =
  "AWS GuardDuty analyzes CloudTrail, VPC Flow Logs, DNS and EKS audit data for threats. How it works, what its findings mean, and the gap it leaves for image scanning.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "aws guardduty",
    "guardduty findings",
    "guardduty runtime monitoring",
    "aws threat detection",
    "guardduty eks protection",
    "guardduty malware protection",
    "aws container security",
    "guardduty vs vulnerability scanning",
    "guardduty severity levels",
    "aws security hub guardduty",
  ],
  alternates: { canonical: "/blog/aws-guardduty" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/aws-guardduty",
    images: ["/blog/aws-guardduty.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/aws-guardduty.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "AWS GuardDuty: What It Detects and What It Misses",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/aws-guardduty",
  image: "https://scanrook.io/blog/aws-guardduty.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AWS GuardDuty?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AWS GuardDuty is a managed threat detection service. It continuously analyzes AWS telemetry — CloudTrail management and data events, VPC Flow Logs, DNS query logs, EKS audit logs and more — against threat intelligence feeds and behavioral models, and emits findings when it sees activity consistent with compromise. There are no agents to deploy for the log-based detections; you enable a detector per region.",
      },
    },
    {
      "@type": "Question",
      name: "Does GuardDuty scan for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. GuardDuty detects malicious or anomalous behavior, and its Malware Protection feature scans for malware signatures. It does not enumerate installed packages or match them against CVE advisories. Vulnerability scanning of container images is a separate job handled by Amazon Inspector, ECR scanning, or a dedicated image scanner.",
      },
    },
    {
      "@type": "Question",
      name: "What do GuardDuty severity levels mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Findings carry a numeric severity that AWS buckets into labels. Roughly, 1.0-3.9 is Low, 4.0-6.9 is Medium and 7.0-8.9 is High, with a Critical tier used for correlated multi-step attack sequences. The number reflects GuardDuty's confidence and the potential impact of the activity, not the exploitability of any particular software package.",
      },
    },
    {
      "@type": "Question",
      name: "What is GuardDuty Runtime Monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Runtime Monitoring adds an eBPF-based security agent that observes process execution, file access and network activity inside EKS, ECS and EC2 workloads. It gives GuardDuty visibility below the AWS control plane, so it can flag things like a reverse shell spawned inside a container rather than only API-level anomalies.",
      },
    },
    {
      "@type": "Question",
      name: "How does image scanning complement GuardDuty?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GuardDuty tells you something bad is happening now; image scanning tells you what vulnerable software you shipped before it ever ran. Scanning at build time removes the exploitable packages that runtime detection would otherwise have to catch mid-attack. Most teams run both: a scanner in CI as a gate, and GuardDuty in production as a detector.",
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
          <div className="text-xs uppercase tracking-wide muted">Integrations</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            AWS GuardDuty: What It Detects and What It Misses
          </h1>
          <p className="text-sm muted">Published September 17, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            AWS GuardDuty is the detection layer most AWS accounts turn on first, and for good
            reason: it needs no agents for its core coverage, it reads telemetry you are already
            producing, and it turns that into findings you can route somewhere useful. It is also
            frequently misunderstood as a vulnerability scanner, which it is not. Here is what
            GuardDuty actually watches, how to read its findings, and where you still need
            build-time scanning.
          </p>
        </header>

        <img
          src="/blog/aws-guardduty.jpg"
          alt="AWS GuardDuty threat detection across cloud infrastructure telemetry"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What GuardDuty is watching</h2>
          <p className="text-sm muted">
            GuardDuty is a managed threat detection service. You enable a detector in a region and
            it begins consuming AWS-native telemetry directly from the service planes &mdash; you do
            not have to enable, store or pay for those logs separately for GuardDuty to read them.
            The foundational data sources are CloudTrail management events, VPC Flow Logs and DNS
            query logs resolved through the Route&nbsp;53 Resolver. On top of that sit optional
            protection plans: S3 Protection (CloudTrail S3 data events), EKS Protection (Kubernetes
            audit logs), RDS Protection (login activity), Lambda Protection (network activity),
            Malware Protection, and Runtime Monitoring.
          </p>
          <p className="text-sm muted">
            Against that stream GuardDuty applies three broad techniques. The first is threat
            intelligence matching: traffic to or from IPs and domains on AWS-curated and
            partner-supplied lists, plus any lists you upload yourself. The second is signature-like
            detection of known-bad patterns, such as the specific DNS behaviour of common
            cryptomining pools or command-and-control frameworks. The third is anomaly detection
            &mdash; GuardDuty builds a baseline of normal API usage per principal and flags
            deviations, which is how it catches a role suddenly enumerating every bucket in the
            account at 3am from an unfamiliar geography.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading a finding</h2>
          <p className="text-sm muted">
            GuardDuty finding types follow a consistent grammar, which makes them far easier to
            triage once you know the shape:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`ThreatPurpose : ResourceTypeAffected / ThreatFamilyName . DetectionMechanism ! Artifact

UnauthorizedAccess:EC2/SSHBruteForce
CryptoCurrency:EC2/BitcoinTool.B!DNS
Discovery:S3/MaliciousIPCaller
Execution:Runtime/NewBinaryExecuted
Persistence:IAMUser/AnomalousBehavior`}</pre>
          <p className="text-sm muted">
            The <em>ThreatPurpose</em> maps loosely onto MITRE ATT&amp;CK tactics &mdash; Discovery,
            Execution, Persistence, Exfiltration, Impact &mdash; which is useful when you are
            correlating GuardDuty with other tooling. If those tactic names are unfamiliar, our{" "}
            <Link href="/blog/mitre-attack" className="underline">
              MITRE ATT&amp;CK primer
            </Link>{" "}
            covers the framework. The <em>DetectionMechanism</em> suffix tells you how GuardDuty saw
            it, and a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">!DNS</code>{" "}
            artifact in particular means the evidence is a resolver query, not observed traffic
            &mdash; a distinction that matters when you are deciding whether something actually
            connected.
          </p>
          <p className="text-sm muted">
            Severity is a number, not a label. Broadly, 1.0&ndash;3.9 renders as Low, 4.0&ndash;6.9
            as Medium and 7.0&ndash;8.9 as High, with a Critical tier reserved for correlated attack
            sequences where GuardDuty has stitched several findings into one narrative. Treat the
            number as a mix of confidence and blast radius. It is not a CVSS score and it says
            nothing about whether a package on the host is patched.
          </p>
        </section>

        <figure className="grid gap-2">
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 250"
              role="img"
              aria-label="Diagram: AWS telemetry sources feed GuardDuty detection techniques, which emit findings to EventBridge, Security Hub and S3, while image scanning covers a separate build-time layer"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="gd-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { y: 8, label: "CloudTrail events" },
                { y: 46, label: "VPC Flow Logs" },
                { y: 84, label: "DNS query logs" },
                { y: 122, label: "EKS audit logs" },
                { y: 160, label: "Runtime agent (eBPF)" },
              ].map((s) => (
                <g key={s.label}>
                  <rect x={4} y={s.y} width={190} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} />
                  <text x={99} y={s.y + 20} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.85}>
                    {s.label}
                  </text>
                  <line x1={198} y1={s.y + 15} x2={244} y2={100} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} markerEnd="url(#gd-arrow)" />
                </g>
              ))}
              <rect x={256} y={54} width={172} height={96} rx={8} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
              <text x={342} y={82} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">GuardDuty</text>
              <text x={342} y={102} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.65}>threat intel</text>
              <text x={342} y={118} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.65}>known patterns</text>
              <text x={342} y={134} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.65}>anomaly baselines</text>
              {[
                { y: 40, label: "EventBridge rule" },
                { y: 88, label: "Security Hub" },
                { y: 136, label: "S3 export / SIEM" },
              ].map((o) => (
                <g key={o.label}>
                  <line x1={432} y1={100} x2={484} y2={o.y + 15} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} markerEnd="url(#gd-arrow)" />
                  <rect x={496} y={o.y} width={210} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} />
                  <text x={601} y={o.y + 20} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.85}>
                    {o.label}
                  </text>
                </g>
              ))}
              <line x1={4} y1={200} x2={706} y2={200} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="4 4" />
              <rect x={4} y={212} width={702} height={32} rx={6} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.25} strokeDasharray="4 4" />
              <text x={355} y={232} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.7}>
                not covered above: package inventory and CVE matching of the image, before it runs
              </text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            GuardDuty consumes AWS telemetry and emits findings downstream. The dashed band is the
            build-time layer it does not cover.
          </figcaption>
        </figure>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Turning it on, and routing it</h2>
          <p className="text-sm muted">
            Enabling GuardDuty is one API call per region, but a detector whose findings nobody reads
            is decoration. The two things worth doing on day one are enabling it organization-wide
            through a delegated administrator account, and wiring findings into EventBridge so they
            reach a human or a ticket queue.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# enable a detector in the current region
aws guardduty create-detector --enable \\
  --finding-publishing-frequency FIFTEEN_MINUTES

DETECTOR=$(aws guardduty list-detectors --query 'DetectorIds[0]' --output text)

# list current high-severity findings
aws guardduty list-findings \\
  --detector-id "$DETECTOR" \\
  --finding-criteria '{"Criterion":{"severity":{"Gte":7}}}'`}</pre>
          <p className="text-sm muted">
            Findings are published to EventBridge automatically on the default event bus, with source{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">aws.guardduty</code>{" "}
            and detail type{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">GuardDuty Finding</code>.
            A rule that filters on severity keeps the noise manageable:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [{ "numeric": [">=", 7] }]
  }
}`}</pre>
          <p className="text-sm muted">
            One operational note: GuardDuty bills on the volume of telemetry analyzed, so a chatty
            VPC or a high-traffic S3 bucket drives cost more than the number of accounts does. Run
            the free trial in a representative account before you extrapolate.
          </p>
        </section>

        <img
          src="/blog/aws-guardduty-2.jpg"
          alt="GuardDuty finding streams and anomaly detection across AWS audit logs"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            AWS GuardDuty and containers
          </h2>
          <p className="text-sm muted">
            For container workloads GuardDuty has two relevant pieces. EKS Protection reads the
            Kubernetes audit log and flags control-plane abuse: an anonymous user granted cluster
            admin, a pod created with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostNetwork</code>{" "}
            and privileged security context, exec into a running pod from an unusual principal. That
            covers the API surface but sees nothing inside the container.
          </p>
          <p className="text-sm muted">
            Runtime Monitoring closes that gap with an eBPF security agent, deployed as an EKS add-on
            or automatically for ECS on Fargate. It observes process execution, file access and
            network connections inside the workload and produces{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Execution:Runtime/*</code>{" "}
            and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">PrivilegeEscalation:Runtime/*</code>{" "}
            findings. Conceptually this is the same territory as{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco
            </Link>{" "}
            and other kernel-level sensors, packaged as a managed service with AWS-authored rules
            instead of rules you write. Our{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              container runtime security overview
            </Link>{" "}
            compares the approaches in more depth.
          </p>
          <p className="text-sm muted">
            Malware Protection is worth calling out because it is the closest GuardDuty gets to
            inspecting artifacts. For EC2 it takes a snapshot of attached EBS volumes and scans them
            agentlessly for malware signatures; for S3 it scans newly uploaded objects. That is
            signature matching against known malicious files &mdash; a genuinely different question
            from &ldquo;which of my installed packages have published CVEs.&rdquo;
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What GuardDuty does not do</h2>
          <p className="text-sm muted">
            This is the part teams get wrong. GuardDuty is a detector, not an inventory tool. It does
            not read your RPM or dpkg database, it does not resolve your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package-lock.json</code>,
            and it will never tell you that the base image you deployed last quarter carries a
            critical OpenSSL advisory. In AWS terms that job belongs to Amazon Inspector or ECR
            enhanced scanning, and outside AWS to whichever scanner you run in CI.
          </p>
          <p className="text-sm muted">
            The distinction matters operationally because the two produce different work. A GuardDuty
            finding is an incident: somebody needs to look at it now, and the outcome is containment.
            A vulnerability finding is a backlog item: somebody needs to prioritise it, and the
            outcome is a rebuild. Mixing them into one queue reliably means the incidents get buried.
            If you are building that triage process, our guide to{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              triaging scan results
            </Link>{" "}
            covers the vulnerability side.
          </p>
          <p className="text-sm muted">
            There is also a coverage subtlety: GuardDuty is per-region and per-account. A detector in
            us-east-1 sees nothing in eu-west-1. Enabling it through AWS Organizations with
            auto-enable for new accounts and new regions is the only way to keep coverage honest as
            the estate grows.
          </p>
        </section>

        <img
          src="/blog/aws-guardduty-3.jpg"
          alt="Runtime threat detection alongside build-time container image scanning"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook sits on the other side of the deploy. It scans the artifact &mdash; a container
            image tarball, a source archive, a binary &mdash; before it reaches a registry or a
            cluster, reads the actual installed package databases, and matches them against OSV, NVD
            and Red Hat OVAL. That is the inventory-and-advisory job GuardDuty deliberately does not
            do. If you are already scanning in{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR
            </Link>
            , ScanRook is a portable second opinion that runs the same way whether the image ends up
            in ECR, another registry, or an air-gapped environment.
          </p>
          <p className="text-sm muted">
            The two are genuinely complementary and neither replaces the other. Scanning removes
            vulnerable software before it ships, which shrinks what an attacker can use. GuardDuty
            catches the attack that gets through anyway &mdash; a leaked credential, a misconfigured
            role, a zero-day you could not have scanned for. Run the scanner as a gate in CI and
            GuardDuty as a detector in production, and keep their outputs in separate queues.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Does GuardDuty need agents?</h3>
              <p className="text-sm muted mt-1">
                Not for its foundational and log-based protections &mdash; those read AWS service
                telemetry directly. Runtime Monitoring is the exception and deploys an eBPF security
                agent into your EKS, ECS or EC2 workloads.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is GuardDuty a vulnerability scanner?</h3>
              <p className="text-sm muted mt-1">
                No. It detects behaviour and, via Malware Protection, known malicious files. It does
                not enumerate packages or match them to CVEs; that is Amazon Inspector, ECR scanning,
                or a dedicated image scanner.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I stop findings from being ignored?</h3>
              <p className="text-sm muted mt-1">
                Route them through EventBridge with a severity filter into whatever your on-call
                actually watches, and suppress known-benign finding types with suppression rules
                rather than letting people learn to skim past them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What drives GuardDuty cost?</h3>
              <p className="text-sm muted mt-1">
                Volume of analyzed telemetry &mdash; CloudTrail events, flow log gigabytes, S3 data
                events &mdash; not account count. Trial it in a representative account before
                estimating for the whole organization.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the build-time half</h3>
          <p className="text-sm muted leading-relaxed">
            GuardDuty watches what your workloads do. ScanRook tells you what is inside them before
            they run &mdash; installed packages matched against OSV, NVD and Red Hat OVAL, with every
            finding tagged by source and confidence.
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
            <Link href="/blog/container-runtime-security" className="underline">
              Container Runtime Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco Runtime Security Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

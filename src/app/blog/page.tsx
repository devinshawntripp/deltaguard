import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Blog | ${APP_NAME}`,
  description:
    "Educational articles on vulnerability scanning, CVE databases, exploit prediction, and container security from ScanRook.",
  openGraph: {
    title: `Blog | ${APP_NAME}`,
    description:
      "Educational articles on vulnerability scanning, CVE databases, exploit prediction, and container security from ScanRook.",
  },
};

interface BlogPost {
  href: string;
  category: string;
  title: string;
  description: string;
}

const posts: BlogPost[] = [
  {
    href: "/blog/what-is-osv",
    category: "Data sources",
    title: "What Is the OSV API? Ecosystems, Advisories, and How It Works",
    description:
      "A practical guide to the Open Source Vulnerabilities database, the advisory format it uses, and how scanners query it for vulnerability data.",
  },
  {
    href: "/blog/understanding-nvd-and-cvss",
    category: "Data sources",
    title: "Understanding the NVD and CVSS v3.1 Scoring",
    description:
      "How the National Vulnerability Database works, what CPE matching means, and how CVSS v3.1 base scores are calculated.",
  },
  {
    href: "/blog/epss-scores-explained",
    category: "Prioritization",
    title: "EPSS Scores Explained: Exploit Prediction for Vulnerability Prioritization",
    description:
      "What EPSS is, how percentile scores work, and why exploit probability is a better prioritization signal than severity alone.",
  },
  {
    href: "/blog/cisa-kev-guide",
    category: "Prioritization",
    title: "CISA KEV Guide: Why Actively Exploited CVEs Demand Immediate Action",
    description:
      "What the CISA Known Exploited Vulnerabilities catalog is, who it applies to, and how to use it in your remediation workflow.",
  },
  {
    href: "/blog/installed-state-vs-advisory-matching",
    category: "Scanning concepts",
    title: "Installed-State Scanning vs. Advisory Matching: Reducing False Positives",
    description:
      "Why reading actual package manager databases produces more accurate findings than matching file paths against advisory lists.",
  },
  {
    href: "/blog/container-scanning-best-practices",
    category: "Best practices",
    title: "Container Scanning Best Practices for Security Teams",
    description:
      "Practical guidance on scanning container images effectively, from base image selection to CI/CD integration and finding prioritization.",
  },
  {
    href: "/blog/what-is-sbom-and-how-scanrook-uses-it",
    category: "Technical deep-dive",
    title: "What Is an SBOM? How ScanRook Uses SBOMs for Faster, More Accurate Triage",
    description:
      "A practical guide to SBOMs, why they matter for security programs, and how ScanRook uses them in real workflows.",
  },
  {
    href: "/blog/why-we-built-scanrook",
    category: "Launch",
    title: "Why We Built ScanRook",
    description:
      "Why we chose a local-first scanner architecture with optional cloud enrichment.",
  },
];

export default function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14 grid gap-8">
      <section className="surface-card p-8 grid gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">ScanRook Blog</h1>
        <p className="text-sm muted">
          Educational articles on vulnerability scanning, CVE databases, exploit
          prediction, and container security.
        </p>
      </section>

      {posts.map((post) => (
        <section key={post.href} className="surface-card p-8 grid gap-2">
          <div className="text-xs uppercase tracking-wide muted">
            {post.category}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            <Link href={post.href} className="hover:underline">
              {post.title}
            </Link>
          </h2>
          <p className="text-sm muted">{post.description}</p>
          <div>
            <Link
              href={post.href}
              className="btn-secondary inline-flex"
            >
              Read post
            </Link>
          </div>
        </section>
      ))}
    </main>
  );
}

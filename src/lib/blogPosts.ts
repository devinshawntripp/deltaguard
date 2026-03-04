export type BlogPost = {
  href: string;
  category: string;
  title: string;
  description: string;
  featured?: boolean;
};

export const posts: BlogPost[] = [
  {
    href: "/blog/scanrook-benchmark-results",
    category: "Benchmarks",
    title: "ScanRook Benchmark Results: Real Scan Data Against Trivy and Grype",
    description:
      "Transparent benchmark results comparing ScanRook, Trivy, and Grype on five container images with analysis of finding differences.",
    featured: true,
  },
  {
    href: "/blog/why-we-built-scanrook",
    category: "Launch",
    title: "Why We Built ScanRook",
    description:
      "Why we chose a local-first scanner architecture with optional cloud enrichment.",
    featured: true,
  },
  {
    href: "/blog/what-is-sbom-and-how-scanrook-uses-it",
    category: "Technical deep-dive",
    title: "What Is an SBOM? How ScanRook Uses SBOMs for Faster, More Accurate Triage",
    description:
      "A practical guide to SBOMs, why they matter for security programs, and how ScanRook uses them in real workflows.",
    featured: true,
  },
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
    href: "/blog/what-is-yara",
    category: "Deep scanning",
    title: "What Is YARA and Why Security Teams Use It",
    description:
      "A guide to YARA, the pattern-matching engine used by security teams for malware detection, and how ScanRook integrates it for deep container scanning.",
  },
  {
    href: "/blog/compliance-scanning-guide",
    category: "Compliance",
    title: "Vulnerability Scanning for Compliance: What You Need to Know",
    description:
      "Penalties for non-compliance, scanning frequency requirements by framework, and how to build a compliant vulnerability scanning program.",
  },
  {
    href: "/blog/on-prem-vs-saas-scanning",
    category: "Architecture",
    title: "On-Prem vs SaaS Vulnerability Scanning: Which Is Right for You?",
    description:
      "Data sovereignty, air-gapped environments, cost comparison, and when on-prem scanning is required versus when SaaS makes sense.",
  },
];

export const categoryColors: Record<string, string> = {
  Benchmarks: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Launch: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Technical deep-dive": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "Data sources": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Prioritization: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "Scanning concepts": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  "Best practices": "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  "Deep scanning": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Compliance: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  Architecture: "bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-300",
};

export type BlogPost = {
  href: string;
  category: string;
  title: string;
  description: string;
  featured?: boolean;
  publishDate?: string; // ISO YYYY-MM-DD; absent = always visible
  image?: string;       // e.g. "/blog/is-nginx-docker-image-safe.jpg"
};

export const posts: BlogPost[] = [
  {
    href: "/blog/how-to-scan-docker-image-for-vulnerabilities",
    category: "Best practices",
    title: "How to Scan a Docker Image for Vulnerabilities (4 Ways)",
    description:
      "A step-by-step guide to scanning Docker images for vulnerabilities with Docker Scout, Trivy, Grype, and ScanRook — how to export an image, read the results, fix findings, and automate scanning in CI/CD.",
    featured: true,
  },
  {
    href: "/blog/what-is-a-cve",
    category: "Security Concepts",
    title: "What Is a CVE? A Plain-English Guide to Vulnerability IDs",
    description:
      "What a CVE is, what the ID format means, who assigns them, and how the CVE lifecycle works — plus how CVE relates to CVSS, CWE, EPSS, and KEV.",
  },
  {
    href: "/blog/log4shell-cve-2021-44228",
    category: "CVE Deep Dive",
    title: "Log4Shell (CVE-2021-44228) Explained: Detection and Remediation",
    description:
      "A clear technical explanation of Log4Shell (CVE-2021-44228), the critical Log4j RCE — how the JNDI exploit worked, affected versions, the follow-up CVEs, and how to detect and remediate vulnerable JARs.",
  },
  {
    href: "/blog/scanrook-mcp-ai-vulnerability-scanning",
    category: "Integrations",
    title: "ScanRook MCP Server: Let AI Assistants Scan for Vulnerabilities",
    description:
      "Introducing the ScanRook MCP server — give Claude, GPT, and any MCP-compatible AI assistant the ability to scan container images, check CVEs, and analyze licenses through natural conversation.",
    featured: true,
  },
  {
    href: "/blog/vulnerability-scanner-benchmark-2026",
    category: "Benchmarks",
    title: "Vulnerability Scanner Benchmark 2026: ScanRook vs Trivy vs Grype vs Snyk",
    description:
      "Comprehensive 2026 vulnerability scanner benchmark comparing ScanRook, Trivy, Grype, and Snyk on real container images. Methodology, timing data, finding counts, and accuracy analysis.",
    featured: true,
  },
  {
    href: "/blog/alpine-vs-debian-vs-distroless",
    category: "Best practices",
    title: "Alpine vs Debian vs Distroless: Which Container Base Image Is Most Secure?",
    description:
      "Comprehensive comparison of Alpine, Debian Slim, Ubuntu, and Distroless container base images for security. Real vulnerability scan data, size comparison, compatibility tradeoffs, and migration guide.",
  },
  {
    href: "/blog/epss-vulnerability-prioritization",
    category: "Prioritization",
    title: "EPSS Scores: How to Prioritize Vulnerabilities by Exploit Probability",
    description:
      "A practical guide to using EPSS for vulnerability prioritization. Decision matrix, real CVE examples, CVSS comparison, and integration with ScanRook.",
  },
  {
    href: "/blog/regresshion-cve-2024-6387",
    category: "CVE Deep Dive",
    title: "regreSSHion (CVE-2024-6387): The OpenSSH Vulnerability That Exposed Millions of Servers",
    description:
      "Deep dive into regreSSHion (CVE-2024-6387), the OpenSSH signal handler race condition that affected 14 million internet-facing servers. Technical analysis, detection, and remediation.",
  },
  {
    href: "/blog/cve-database-comparison",
    category: "Data sources",
    title: "CVE Database Comparison: NVD vs OSV vs GHSA vs Snyk Intel (2026)",
    description:
      "Comprehensive comparison of vulnerability databases — NVD, OSV, GHSA, Snyk Intel, and Red Hat OVAL — covering coverage, update speed, API access, and when to use each.",
    featured: true,
  },
  {
    href: "/blog/container-security-checklist",
    category: "Best practices",
    title: "Container Image Security Checklist: 15 Steps for Production-Ready Images",
    description:
      "A comprehensive 15-step security checklist for hardening container images before production deployment, covering base images, scanning, secrets, runtime security, and monitoring.",
  },
  {
    href: "/blog/how-to-read-sbom",
    category: "Technical deep-dive",
    title: "How to Read an SBOM: CycloneDX vs SPDX Explained with Real Examples",
    description:
      "Learn how to read and interpret Software Bill of Materials in CycloneDX and SPDX formats with annotated real-world examples, comparison tables, and regulatory context.",
  },
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
    href: "/blog/what-we-learned-from-black-duck",
    category: "License Compliance",
    title: "What We Learned from Black Duck (And How We Made License Scanning Better)",
    description:
      "How Black Duck pioneered license scanning with snippet matching and proprietary databases, what has changed since 2005, and how modern tools deliver the same results at a fraction of the cost.",
  },
  {
    href: "/blog/open-source-license-compliance-guide",
    category: "License Compliance",
    title: "The Complete Guide to Open Source License Compliance in 2026",
    description:
      "A comprehensive guide to open source license compliance covering legal risks, common mistakes, building a compliance program, tooling comparisons, and SBOM integration.",
  },
  {
    href: "/blog/on-prem-vs-saas-scanning",
    category: "Architecture",
    title: "On-Prem vs SaaS Vulnerability Scanning: Which Is Right for You?",
    description:
      "Data sovereignty, air-gapped environments, cost comparison, and when on-prem scanning is required versus when SaaS makes sense.",
  },
  {
    href: "/blog/redhat-backporting-explained",
    category: "Security Concepts",
    title:
      "How Red Hat Backports Security Patches: A Complete Guide to RHEL Vulnerability Management",
    description:
      "Understand how Red Hat backports security fixes, why package versions don't tell the full story, and how OVAL/CSAF data enables accurate RHEL vulnerability scanning.",
  },
  {
    href: "/blog/is-nginx-docker-image-safe",
    category: "Security Concepts",
    title: "Is the Nginx Docker Image Safe? What Our Scanner Found",
    description:
      "We scanned nginx:1.27 with ScanRook: 2,952 findings (408 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 79%.",
    publishDate: "2026-07-06",
    image: "/blog/series-image-safety-1.jpg",
  },
  {
    href: "/blog/how-to-reduce-cves-in-docker-images",
    category: "Best practices",
    title: "How to Reduce CVEs in Docker Images: 6 Steps That Work",
    description:
      "Six concrete steps to reduce CVEs in Docker images: smaller base images, multi-stage builds, package updates, rebuild cadence, and scan verification.",
    publishDate: "2026-07-07",
    image: "/blog/how-to-reduce-cves-in-docker-images.jpg",
  },
  {
    href: "/blog/scan-docker-images-github-actions",
    category: "Integrations",
    title: "How to Scan Docker Images in GitHub Actions",
    description:
      "A complete GitHub Actions workflow for scanning Docker images: install the scanner, scan on pull request, upload reports, and fail builds on critical CVEs.",
    publishDate: "2026-07-09",
    image: "/blog/scan-docker-images-github-actions.jpg",
  },
  {
    href: "/blog/trivy-alternatives",
    category: "Benchmarks",
    title: "Trivy Alternatives in 2026: When to Use Something Else",
    description:
      "An honest look at Trivy alternatives — ScanRook, Grype, Snyk, Docker Scout — with benchmark data on finding depth, speed, and if Trivy is still right.",
    publishDate: "2026-07-13",
    image: "/blog/trivy-alternatives.jpg",
  },
  {
    href: "/blog/nvd-backlog-explained",
    category: "Compliance",
    title: "The NVD Backlog, Explained: What Happened and What It Means",
    description:
      "Why the National Vulnerability Database fell behind on CVE enrichment in 2024, how CISA Vulnrichment stepped in, and what the gap means for your scanner.",
    publishDate: "2026-08-18",
    image: "/blog/nvd-backlog-explained.jpg",
  },

  // ── Drip campaign July-August 2026 (worker-generated) ──
  {
  href: "/blog/is-postgres-docker-image-safe",
  category: "Security Concepts",
  title: "Is the Postgres Docker Image Safe? What Our Scanner Found",
  description:
    "We scanned postgres:17 with ScanRook: 2,983 findings (387 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 86%.",
  publishDate: "2026-07-08",
  image: "/blog/series-image-safety-2.jpg",
},
  {
  href: "/blog/is-redis-docker-image-safe",
  category: "Security Concepts",
  title: "Is the Redis Docker Image Safe? What Our Scanner Found",
  description:
    "We scanned redis:7-alpine with ScanRook: 299 findings (20 critical) versus 1,399 (114 critical) for the Debian-based redis:7 tag. Which tag actually wins.",
  publishDate: "2026-07-10",
  image: "/blog/series-image-safety-3.jpg",
},
  {
  href: "/blog/how-to-patch-docker-base-image-vulnerabilities",
  category: "Best practices",
  title: "How to Patch Docker Base Image Vulnerabilities",
  description:
    "A step-by-step guide to patching Docker base image vulnerabilities: retag, rebuild with --pull, apply OS patches, pin digests, and verify with a scan.",
  publishDate: "2026-07-11",
  image: "/blog/how-to-patch-docker-base-image-vulnerabilities.jpg",
},
  {
  href: "/blog/is-node-docker-image-safe",
  category: "Security Concepts",
  title: "Is the Node Docker Image Safe? What Our Scanner Found",
  description:
    "We scanned node:22 with ScanRook: 30,726 findings (1,794 critical). What that means, which CVEs matter, and why node:22-alpine cuts findings by 99%.",
  publishDate: "2026-07-12",
  image: "/blog/series-image-safety-4.jpg",
},
  {
  href: "/blog/is-python-docker-image-safe",
  category: "Security Concepts",
  title: "Is the Python Docker Image Safe? What Our Scanner Found",
  description:
    "We scanned python:3.12 with ScanRook: 31,590 findings (1,875 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 99%.",
  publishDate: "2026-07-14",
  image: "/blog/series-image-safety-5.jpg",
},
  {
  href: "/blog/multi-stage-docker-builds-security",
  category: "Best practices",
  title: "Multi-Stage Docker Builds for Security: A Practical Guide",
  description:
    "How multi-stage Docker builds improve security: split build and runtime stages, avoid leaking build secrets, and ship a minimal final image.",
  publishDate: "2026-07-15",
  image: "/blog/multi-stage-docker-builds-security.jpg",
},
  {
  href: "/blog/scan-docker-images-gitlab-ci",
  category: "Integrations",
  title: "How to Scan Docker Images in GitLab CI",
  description:
    "A complete GitLab CI pipeline for scanning Docker images: build in Docker-in-Docker, scan with ScanRook, store reports, and fail merge requests on critical CVEs",
  publishDate: "2026-07-17",
  image: "/blog/scan-docker-images-gitlab-ci.jpg",
},
  {
  href: "/blog/migrating-to-distroless-images",
  category: "Best practices",
  title: "Migrating to Distroless Images: A Step-by-Step Guide",
  description:
    "How to migrate Docker images to distroless: assess your base, adapt the build per language, handle debugging without a shell, and verify with a scan.",
  publishDate: "2026-07-19",
  image: "/blog/migrating-to-distroless-images.jpg",
},
  {
  href: "/blog/grype-alternatives",
  category: "Benchmarks",
  title: "Grype Alternatives in 2026: When to Use Something Else",
  description:
    "An honest look at Grype alternatives — ScanRook, Trivy, Snyk, Docker Scout — with benchmark data on finding depth, SBOM workflows, and when Grype is right.",
  publishDate: "2026-07-21",
  image: "/blog/grype-alternatives.jpg",
},
  {
  href: "/blog/jenkins-container-scanning",
  category: "Integrations",
  title: "Jenkins Docker Image Scanning: A Complete Pipeline",
  description:
    "A complete Jenkins pipeline for scanning Docker images: build, save, scan with ScanRook, archive the report, and fail the build on critical or high CVEs.",
  publishDate: "2026-07-25",
  image: "/blog/jenkins-container-scanning.jpg",
},
  {
  href: "/blog/docker-image-hardening-checklist",
  category: "Best practices",
  title: "Docker Image Hardening Checklist: 8 Steps With Code",
  description:
    "An eight-step Docker image hardening checklist with runnable code for each step: non-root users, minimal base images, capability drops, and scanning.",
  publishDate: "2026-07-27",
  image: "/blog/docker-image-hardening-checklist.jpg",
},
  {
  href: "/blog/automate-docker-base-image-updates",
  category: "Best practices",
  title: "How to Automate Docker Base Image Updates",
  description:
    "How to automate Docker base image updates with Renovate or Dependabot, scheduled CI rebuilds, digest pinning, and automatic scan verification.",
  publishDate: "2026-07-31",
  image: "/blog/automate-docker-base-image-updates.jpg",
},
  {
  href: "/blog/fix-npm-vulnerabilities-in-docker",
  category: "Best practices",
  title: "How to Fix npm Vulnerabilities in Docker Builds",
  description:
    "How to fix npm vulnerabilities in Docker builds: audit and patch the lockfile, use npm ci, exclude devDependencies, and verify with a rescan.",
  publishDate: "2026-08-04",
  image: "/blog/fix-npm-vulnerabilities-in-docker.jpg",
},
  {
  href: "/blog/snyk-vs-open-source-scanners",
  category: "Benchmarks",
  title: "Snyk vs Trivy vs Grype: Which Should You Actually Use?",
  description:
    "Snyk vs Trivy vs Grype compared honestly: pricing, workflow, and finding depth, with benchmark data on where open source diverges from commercial scanners.",
  publishDate: "2026-08-06",
  image: "/blog/snyk-vs-open-source-scanners.jpg",
},
  {
  href: "/blog/minimal-docker-images-guide",
  category: "Best practices",
  title: "The Minimal Docker Image Guide: Alpine, Distroless, Scratch",
  description:
    "A practical guide to building minimal Docker images: choosing a base tier, static binaries into scratch, multi-stage cleanup, and size verification.",
  publishDate: "2026-08-08",
  image: "/blog/minimal-docker-images-guide.jpg",
},
  {
  href: "/blog/how-to-triage-vulnerability-scan-results",
  category: "Best practices",
  title: "How to Triage Vulnerability Scan Results",
  description:
    "A repeatable vulnerability triage process: rank findings by severity, EPSS, KEV, and reachability, gate CI, assign owners, and re-scan on a cadence.",
  publishDate: "2026-08-12",
  image: "/blog/how-to-triage-vulnerability-scan-results.jpg",
},
  {
  href: "/blog/sbom-requirements-2026",
  category: "Compliance",
  title: "SBOM Requirements in 2026: A Practical Map",
  description:
    "A practical map of SBOM requirements in 2026: federal procurement, the EU Cyber Resilience Act, FDA medical device rules, and what teams need in place now.",
  publishDate: "2026-08-14",
  image: "/blog/sbom-requirements-2026.jpg",
},
  {
  href: "/blog/osv-vs-nvd",
  category: "Benchmarks",
  title: "OSV vs NVD: How the Two Vulnerability Databases Actually Differ",
  description:
    "OSV vs NVD compared: how each publishes and matches vulnerability data, where their coverage diverges, and why scanners that use only one develop blind spots.",
  publishDate: "2026-08-15",
  image: "/blog/osv-vs-nvd.jpg",
},
  {
  href: "/blog/kubernetes-admission-control-image-scanning",
  category: "Integrations",
  title: "Kubernetes Admission Control for Image Scanning",
  description:
    "How Kubernetes admission control blocks unscanned or vulnerable container images at deploy time, with a working Kyverno policy and where ScanRook fits the gate.",
  publishDate: "2026-08-16",
  image: "/blog/kubernetes-admission-control-image-scanning.jpg",
},
  {
  href: "/blog/eu-cyber-resilience-act-containers",
  category: "Compliance",
  title: "The EU Cyber Resilience Act and Container Images",
  description:
    "What the EU Cyber Resilience Act means for container images: SBOM duties, vulnerability handling, and patching obligations for products with digital elements.",
  publishDate: "2026-08-17",
  image: "/blog/eu-cyber-resilience-act-containers.jpg",
},
  {
  href: "/blog/cyclonedx-vs-spdx",
  category: "Compliance",
  title: "CycloneDX vs SPDX: Which SBOM Format Should You Use?",
  description:
    "CycloneDX vs SPDX compared: origins, VEX support, license-compliance depth, and which SBOM format to pick for security versus legal workflows.",
  publishDate: "2026-08-20",
  image: "/blog/cyclonedx-vs-spdx.jpg",
},
  {
  href: "/blog/sbom-generation-in-ci",
  category: "Compliance",
  title: "How to Generate an SBOM in CI (Working GitHub Actions Example)",
  description:
    "How to generate an SBOM in CI: a working GitHub Actions workflow, format choice, enrichment, and gating builds on unexpected dependency changes.",
  publishDate: "2026-08-21",
  image: "/blog/sbom-generation-in-ci.jpg",
},
  {
  href: "/blog/vex-explained",
  category: "Compliance",
  title: "What Is VEX? Vulnerability Exploitability eXchange Explained",
  description:
    "What VEX is and why it matters: how Vulnerability Exploitability eXchange data cuts false positives by telling you if a CVE is actually reachable.",
  publishDate: "2026-08-23",
  image: "/blog/vex-explained.jpg",
},
  {
  href: "/blog/best-container-vulnerability-scanners-2026",
  category: "Benchmarks",
  title: "Best Container Vulnerability Scanners in 2026: An Honest Roundup",
  description:
    "An honest 2026 roundup of container vulnerability scanners: Trivy, Grype, Snyk, Docker Scout, Clair, and ScanRook, compared fairly on capability and depth.",
  publishDate: "2026-08-24",
  image: "/blog/best-container-vulnerability-scanners-2026.jpg",
},
  {
  href: "/blog/what-is-a-cbom",
  category: "Compliance",
  title: "What Is a CBOM? Cryptography Bill of Materials Explained",
  description:
    "A CBOM (Cryptography Bill of Materials) inventories the algorithms, certificates, keys, and libraries in your software, and why PQC migration needs one.",
  publishDate: "2026-08-25",
  image: "/blog/what-is-a-cbom.jpg",
},

  // ── Keyword batch 2: registry & supply-chain articles (Aug–Sep 2026) ──
  {
    href: "/blog/npm-audit-explained",
    category: "Scanning concepts",
    title: "npm audit Explained: What It Catches and What It Misses",
    description:
      "What npm audit checks, how it reads your lockfile against the GitHub Advisory Database, why it over- and under-reports, and where container scanning helps.",
    publishDate: "2026-08-26",
    image: "/blog/npm-audit-explained.jpg",
  },
  {
    href: "/blog/owasp-dependency-check-alternatives",
    category: "Benchmarks",
    title: "OWASP Dependency-Check Alternatives in 2026: A Fair Look",
    description:
      "OWASP Dependency-Check is a free CPE-based SCA scanner. Here are honest alternatives (ScanRook, Trivy, Grype, Snyk, OSV-Scanner) and the cases where each wins.",
    publishDate: "2026-08-27",
    image: "/blog/owasp-dependency-check-alternatives.jpg",
  },
  {
    href: "/blog/software-supply-chain-security",
    category: "Security Concepts",
    title: "Software Supply Chain Security: A Practical Primer",
    description:
      "What software supply chain security means, the attack classes it defends against, and a layered defense from dependency scanning to SBOMs, SLSA, and signing.",
    publishDate: "2026-08-28",
    image: "/blog/software-supply-chain-security.jpg",
  },
  {
    href: "/blog/sigstore-cosign-container-signing",
    category: "Security Concepts",
    title: "Image Signing with Sigstore and Cosign, Explained",
    description:
      "How container image signing works with Sigstore and Cosign: keyless signing, the transparency log, verifying signatures, and where it fits alongside scanning.",
    publishDate: "2026-08-29",
    image: "/blog/sigstore-cosign-container-signing.jpg",
  },
  {
    href: "/blog/pip-audit-python-dependency-scanning",
    category: "Scanning concepts",
    title: "pip-audit: Scanning Python Dependencies for Vulnerabilities",
    description:
      "pip-audit scans your Python dependencies for known CVEs using PyPI and OSV advisory data. How the tool works, what it misses, and where ScanRook fits.",
    publishDate: "2026-08-30",
    image: "/blog/pip-audit-python-dependency-scanning.jpg",
  },
  {
    href: "/blog/govulncheck-go-vulnerability-scanning",
    category: "Scanning concepts",
    title: "govulncheck: Go Vulnerability Scanning That Follows Your Code",
    description:
      "govulncheck finds vulnerabilities in Go code using call-graph analysis and the Go vulnerability database. How it works, its limits, and where ScanRook fits.",
    publishDate: "2026-08-31",
    image: "/blog/govulncheck-go-vulnerability-scanning.jpg",
  },
  {
    href: "/blog/cvss-4-0-explained",
    category: "Security Concepts",
    title: "CVSS 4.0 Explained: What Changed From v3.1 and Why",
    description:
      "CVSS 4.0 explained: the CVSS-B/BT/BTE nomenclature, new metrics like Attack Requirements and Safety, and how the 2023 revision changes severity scoring.",
    publishDate: "2026-09-01",
    image: "/blog/cvss-4-0-explained.jpg",
  },
  {
    href: "/blog/cargo-audit-rust-dependency-scanning",
    category: "Scanning concepts",
    title: "cargo audit: Scanning Rust Dependencies With RustSec",
    description:
      "cargo audit scans Rust dependencies for advisories from the RustSec database. How the tool works, what it covers, its limits, and where ScanRook fits in.",
    publishDate: "2026-09-02",
    image: "/blog/cargo-audit-rust-dependency-scanning.jpg",
  },
  {
    href: "/blog/container-image-scanning-guide",
    category: "Best practices",
    title: "Container Image Scanning: A Practical Guide for 2026",
    description:
      "What container image scanning is, how it works, what it catches and misses, where to run it in your pipeline, and how to choose a scanner that fits.",
    publishDate: "2026-09-03",
    image: "/blog/container-image-scanning-guide.jpg",
  },
  {
    href: "/blog/docker-vulnerability-scanner-guide",
    category: "Best practices",
    title: "Docker Vulnerability Scanner: A Complete Guide",
    description:
      "What a Docker vulnerability scanner does, how it finds CVEs in image layers, the main tools compared, and how to run one in your build pipeline.",
    publishDate: "2026-09-04",
    image: "/blog/docker-vulnerability-scanner-guide.jpg",
  },
  {
    href: "/blog/slsa-framework-explained",
    category: "Compliance",
    title: "The SLSA Framework Explained: Levels and Provenance",
    description:
      "What the SLSA framework is, how its build levels and provenance work, what it does and does not protect against, and how it fits alongside SBOMs.",
    publishDate: "2026-09-05",
    image: "/blog/slsa-framework-explained.jpg",
  },
  {
    href: "/blog/kubernetes-vulnerability-scanning-guide",
    category: "Best practices",
    title: "Kubernetes Vulnerability Scanning: A Practical Guide",
    description:
      "What Kubernetes vulnerability scanning covers, image versus cluster scanning, the main tools, and how to gate vulnerable images before they reach a cluster.",
    publishDate: "2026-09-06",
    image: "/blog/kubernetes-vulnerability-scanning-guide.jpg",
  },
  // ── Replacement batch (real-volume topics) ──
  {
    href: "/blog/shellshock-cve-2014-6271",
    category: "CVE Deep Dive",
    title: "Shellshock (CVE-2014-6271) Explained: Detection and Fixes",
    description:
      "Shellshock (CVE-2014-6271) let attackers run commands through a Bash environment-variable bug. How the exploit worked, affected versions, follow-ups, and fixes.",
    publishDate: "2026-09-08",
    image: "/blog/shellshock-cve-2014-6271.jpg",
  },
  {
    href: "/blog/falco-runtime-security-explained",
    category: "Scanning concepts",
    title: "Falco Explained: Runtime Security vs Image Scanning",
    description:
      "Falco is CNCF runtime security: eBPF syscall threat detection at runtime. How it works, how it differs from image and SCA scanning, and when to use each.",
    publishDate: "2026-09-10",
    image: "/blog/falco-runtime-security-explained.jpg",
  },
  {
    href: "/blog/github-security-advisories-explained",
    category: "Data sources",
    title: "GHSA Explained: What GitHub Security Advisories Are",
    description:
      "GHSA explained: what GitHub Security Advisories and GHSA IDs are, how the GitHub Advisory Database relates to CVE and OSV, and how scanners use it.",
    publishDate: "2026-09-12",
    image: "/blog/github-security-advisories-explained.jpg",
  },
  {
    href: "/blog/what-is-a-zero-day-vulnerability",
    category: "Security Concepts",
    title: "What Is a Zero-Day Vulnerability? A Plain-English Guide",
    description:
      "A plain-English guide to zero-day vulnerabilities: what zero day means, how they differ from n-days, real examples, and how scanning helps post-disclosure.",
    publishDate: "2026-09-14",
    image: "/blog/what-is-a-zero-day-vulnerability.jpg",
  },
  {
    href: "/blog/cis-benchmarks-explained",
    category: "Compliance",
    title: "CIS Benchmarks Explained: Docker and Kubernetes Hardening",
    description:
      "What CIS Benchmarks are: how the consensus hardening guides work, the Docker and Kubernetes benchmarks, kube-bench and Docker Bench, and where scanning fits.",
    publishDate: "2026-09-16",
    image: "/blog/cis-benchmarks-explained.jpg",
  },
  {
    href: "/blog/trufflehog-secret-scanning",
    category: "Scanning concepts",
    title: "TruffleHog: Secret Scanning With Credential Verification",
    description:
      "TruffleHog is an open-source secret scanner that verifies found credentials against live APIs. How it works, what it catches, and where ScanRook fits.",
    publishDate: "2026-09-18",
    image: "/blog/trufflehog-secret-scanning.jpg",
  },
  {
    href: "/blog/what-is-a-vulnerability",
    category: "Security Concepts",
    title: "What Is a Vulnerability? Weaknesses, CVEs, and Risk",
    description:
      "What a vulnerability is in security terms: how it differs from threats and risk, common types, the CVE lifecycle, and how scanners find known weaknesses.",
    publishDate: "2026-07-16",
    image: "/blog/what-is-a-vulnerability.jpg",
  },
  {
    href: "/blog/vulnerability-management-guide",
    category: "Best practices",
    title: "Vulnerability Management: A Practical Lifecycle Guide",
    description:
      "Vulnerability management is a continuous lifecycle, not a one-time scan. The stages, risk-based prioritization, SLAs, metrics, and where ScanRook fits.",
    publishDate: "2026-07-18",
    image: "/blog/vulnerability-management-guide.jpg",
  },
  {
    href: "/blog/what-is-software-composition-analysis",
    category: "Scanning concepts",
    title: "What Is SCA? Software Composition Analysis Explained",
    description:
      "What SCA (software composition analysis) is: how it inventories open-source components, matches them to known CVEs and licenses, and where it fits vs SAST.",
    publishDate: "2026-07-20",
    image: "/blog/what-is-software-composition-analysis.jpg",
  },
  {
    href: "/blog/gitleaks-secret-scanning",
    category: "Scanning concepts",
    title: "Gitleaks: Fast Secret Scanning for Git Repos and CI",
    description:
      "Gitleaks is a fast, open-source secret scanner for git repos and CI. How its regex and entropy detection works, its tradeoffs, and where ScanRook fits.",
    publishDate: "2026-07-22",
    image: "/blog/gitleaks-secret-scanning.jpg",
  },
  {
    href: "/blog/ubuntu-vs-debian-docker-base-image",
    category: "Best practices",
    title: "Ubuntu vs Debian: Which Docker Base Image to Choose",
    description:
      "Ubuntu vs Debian as a Docker base image: real security, size, and support tradeoffs, plus a clear recommendation for most container workloads.",
    publishDate: "2026-07-23",
    image: "/blog/ubuntu-vs-debian-docker-base-image.jpg",
  },
  {
    href: "/blog/sast-vs-dast-explained",
    category: "Security Concepts",
    title: "SAST vs DAST: How Application Security Testing Differs",
    description:
      "SAST vs DAST explained: how static and dynamic application security testing differ, what each catches and misses, and where SCA and IAST fit alongside them.",
    publishDate: "2026-07-24",
    image: "/blog/sast-vs-dast-explained.jpg",
  },
  {
    href: "/blog/anchore-alternatives",
    category: "Benchmarks",
    title: "Anchore Alternatives in 2026: A Fair Comparison",
    description:
      "An honest look at Anchore alternatives — Grype, Syft, Trivy, Snyk, and ScanRook — covering the open-source tools, Anchore Enterprise, and when each wins.",
    publishDate: "2026-07-26",
    image: "/blog/anchore-alternatives.jpg",
  },
  {
    href: "/blog/patch-management-guide",
    category: "Best practices",
    title: "Patch Management: A Practical Guide for Modern Stacks",
    description:
      "Patch management is how you close known vulnerabilities. The lifecycle, prioritization, testing, and why containers are rebuilt instead of patched.",
    publishDate: "2026-07-28",
    image: "/blog/patch-management-guide.jpg",
  },
  {
    href: "/blog/heartbleed-cve-2014-0160",
    category: "CVE Deep Dive",
    title: "Heartbleed (CVE-2014-0160) Explained: Impact and Remediation",
    description:
      "Heartbleed (CVE-2014-0160) leaked server memory through an OpenSSL TLS heartbeat over-read. Affected versions, the private-key risk, and how to remediate it.",
    publishDate: "2026-07-29",
    image: "/blog/heartbleed-cve-2014-0160.jpg",
  },
  {
    href: "/blog/kubernetes-secrets-security",
    category: "Best practices",
    title: "Kubernetes Secrets Security: A Practical Guide",
    description:
      "A practical guide to Kubernetes secrets security: why base64 is not encryption, encryption at rest, RBAC, external secret stores, and safe mounting.",
    publishDate: "2026-07-30",
    image: "/blog/kubernetes-secrets-security.jpg",
  },
  {
    href: "/blog/docker-security-guide",
    category: "Best practices",
    title: "Docker Security: A Practical Hardening Guide for 2026",
    description:
      "A practical Docker security guide: harden containers with non-root users, dropped capabilities, read-only filesystems, seccomp, and image scanning.",
    publishDate: "2026-08-01",
    image: "/blog/docker-security-guide.jpg",
  },
  {
    href: "/blog/docker-rootless-mode",
    category: "Best practices",
    title: "Docker Rootless Mode: How and Why to Run Without Root",
    description:
      "Docker rootless mode runs the daemon as a non-root user so a container escape lands unprivileged. How it works, how to set it up, and its limits.",
    publishDate: "2026-08-02",
    image: "/blog/docker-rootless-mode.jpg",
  },
  {
    href: "/blog/nvd-api-key-guide",
    category: "Data sources",
    title: "NVD API Key: How to Get One and Why Scanners Need It",
    description:
      "How to request and use an NVD API key: the rate limits with and without one, how to send it, and why vulnerability scanners need it for enrichment.",
    publishDate: "2026-08-03",
    image: "/blog/nvd-api-key-guide.jpg",
  },
  {
    href: "/blog/kube-bench-cis-scanning",
    category: "Scanning concepts",
    title: "kube-bench: Scanning Kubernetes Against the CIS Benchmark",
    description:
      "kube-bench checks whether your Kubernetes cluster is configured to the CIS Benchmark. How it works, how to run it, what it catches, and what it does not.",
    publishDate: "2026-08-05",
    image: "/blog/kube-bench-cis-scanning.jpg",
  },
  {
    href: "/blog/secret-scanning-guide",
    category: "Scanning concepts",
    title: "Secret Scanning: A Practical Guide to Finding Leaked Keys",
    description:
      "Secret scanning finds hardcoded credentials in code, git history, and images. Detection methods, the tool landscape, remediation, and where ScanRook fits.",
    publishDate: "2026-08-07",
    image: "/blog/secret-scanning-guide.jpg",
  },
  {
    href: "/blog/trivy-operator-kubernetes",
    category: "Integrations",
    title: "Trivy Operator: Continuous Scanning Inside Kubernetes",
    description:
      "The Trivy Operator continuously scans Kubernetes workloads and writes vulnerability, config, and secret reports as CRDs. How to install and use it.",
    publishDate: "2026-08-09",
    image: "/blog/trivy-operator-kubernetes.jpg",
  },
  {
    href: "/blog/leaky-vessels-cve-2024-21626",
    category: "CVE Deep Dive",
    title: "Leaky Vessels (CVE-2024-21626): runc Container Escape",
    description:
      "Leaky Vessels (CVE-2024-21626) is a runc container escape via a leaked file descriptor. How it works, the affected versions, the 1.1.12 fix, and detection.",
    publishDate: "2026-08-10",
    image: "/blog/leaky-vessels-cve-2024-21626.jpg",
  },
  {
    href: "/blog/pod-security-standards-guide",
    category: "Best practices",
    title: "Pod Security Standards: A Practical Kubernetes Guide",
    description:
      "A practical guide to Kubernetes Pod Security Standards: the Privileged, Baseline, and Restricted profiles, Pod Security Admission, and enforcement.",
    publishDate: "2026-08-11",
    image: "/blog/pod-security-standards-guide.jpg",
  },
  {
    href: "/blog/trivy-vs-grype",
    category: "Benchmarks",
    title: "Trivy vs Grype: An Honest Comparison of Two Scanners",
    description:
      "Trivy vs Grype compared honestly: scope, databases, output formats, speed, and finding depth, with benchmark data and when to pick each scanner.",
    publishDate: "2026-08-13",
    image: "/blog/trivy-vs-grype.jpg",
  },
  {
    href: "/blog/alpine-vs-ubuntu-docker",
    category: "Best practices",
    title: "Alpine vs Ubuntu: Choosing a Docker Base Image",
    description:
      "Alpine vs Ubuntu for Docker base images: musl vs glibc, size and attack surface, compatibility tradeoffs, and how to choose the right one for you.",
    publishDate: "2026-08-19",
    image: "/blog/alpine-vs-ubuntu-docker.jpg",
  },
  {
    href: "/blog/pod-security-admission-guide",
    category: "Best practices",
    title: "Pod Security Admission: A Practical Kubernetes Guide",
    description:
      "Pod Security Admission enforces the Pod Security Standards in Kubernetes with namespace labels. How to configure the enforce, audit, and warn modes safely.",
    publishDate: "2026-08-22",
    image: "/blog/pod-security-admission-guide.jpg",
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
  "License Compliance":
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  Architecture: "bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-300",
  "Security Concepts":
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "CVE Deep Dive":
    "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  Integrations:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
};

import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import PublicSiteShell from "@/components/PublicSiteShell";

export const metadata: Metadata = {
  title: `Pricing | ${APP_NAME}`,
  description:
    "ScanRook pricing: free CLI for unlimited local scans, Pro for cloud enrichment and team workflows, Enterprise for self-hosted deployment and SSO.",
  openGraph: {
    title: `Pricing | ${APP_NAME}`,
    description:
      "Compare ScanRook plans: Free CLI, Pro, and Enterprise.",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Tier {
  name: string;
  price: string;
  priceDetail?: string;
  description: string;
  cta: string;
  ctaHref: string;
  ctaStyle: "primary" | "secondary";
  features: string[];
  highlight?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    priceDetail: "forever",
    description: "Full-featured CLI scanner. No login required.",
    cta: "Install CLI",
    ctaHref: "https://scanrook.sh",
    ctaStyle: "secondary",
    features: [
      "Unlimited local scans",
      "OSV + NVD enrichment",
      "Red Hat OVAL advisory filtering",
      "SBOM import (CycloneDX, SPDX, Syft)",
      "SBOM diff and change tracking",
      "Container, binary, and ISO scanning",
      "All supported distros",
      "Confidence tiers (installed-state-first)",
      "EPSS exploit prediction scoring",
      "CISA KEV tagging",
      "JSON and text output formats",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    priceDetail: "per month",
    description: "Cloud enrichment, team workflows, and scan history.",
    cta: "Get started",
    ctaHref: "/signin",
    ctaStyle: "primary",
    highlight: true,
    features: [
      "Everything in Free",
      "Cloud enrichment (higher API rate limits)",
      "Org and team management",
      "Scan history and dashboard",
      "Real-time scan progress (SSE)",
      "Findings browser with filters",
      "File tree and package explorer",
      "API key management",
      "S3-backed artifact storage",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Self-hosted deployment with dedicated support.",
    cta: "Contact us",
    ctaHref: "mailto:sales@scanrook.io",
    ctaStyle: "secondary",
    features: [
      "Everything in Pro",
      "Self-hosted deployment (Kubernetes)",
      "SSO / SAML authentication",
      "Dedicated support engineer",
      "SLA with guaranteed response times",
      "Custom integrations and API access",
      "Audit logging",
      "Volume licensing",
    ],
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Do I need an account to use ScanRook?",
    answer:
      "No. The CLI scanner is fully functional without any login or account. You only need an account if you want cloud enrichment, team management, or the web dashboard.",
  },
  {
    question: "What does cloud enrichment include?",
    answer:
      "Cloud enrichment provides higher rate limits for NVD and OSV API queries, server-side caching for faster repeat scans, and access to additional advisory data sources. Local scans still work without it.",
  },
  {
    question: "Can I try Pro features before committing?",
    answer:
      "Yes. Sign up for a free account and you will have access to the dashboard and scan history. Cloud enrichment rate limits apply to free accounts, but all features are available to try.",
  },
  {
    question: "What artifacts can ScanRook scan?",
    answer:
      "Container image tars (Docker, OCI), source tarballs, ISO images, and compiled binaries (ELF, PE, Mach-O). The scanner also imports existing SBOMs in CycloneDX, SPDX, and Syft JSON formats.",
  },
  {
    question: "How does installed-state-first scanning work?",
    answer:
      "ScanRook reads the actual package manager databases inside containers (RPM, APK, dpkg, etc.) rather than relying on file path heuristics. Findings from installed packages are classified as ConfirmedInstalled and prioritized over heuristic matches.",
  },
  {
    question: "Is there a self-hosted option?",
    answer:
      "Yes. The Enterprise plan includes a Kubernetes-native deployment with all three services (UI, Worker, Scanner). Contact us for architecture details and deployment support.",
  },
  {
    question: "What data sources does ScanRook use?",
    answer:
      "OSV (Google Open Source Vulnerabilities), NVD (NIST National Vulnerability Database), Red Hat OVAL advisories, CISA KEV (Known Exploited Vulnerabilities), and FIRST.org EPSS (Exploit Prediction Scoring System).",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <PublicSiteShell>
      <main className="mx-auto max-w-5xl px-6 py-14 grid gap-10">
        {/* Header */}
        <section className="surface-card p-8 grid gap-4">
          <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Pricing
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-sm muted max-w-3xl">
            Start scanning for free with the CLI. Add cloud enrichment and team
            features when you need them. No surprises, no per-scan fees.
          </p>
        </section>

        {/* Tiers */}
        <section className="grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </section>

        {/* FAQ */}
        <section className="grid gap-4">
          <div className="surface-card p-6 grid gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-sm muted">
              Common questions about ScanRook plans and features.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="surface-card p-5 grid gap-2 content-start">
                <h3 className="text-sm font-semibold leading-snug">
                  {faq.question}
                </h3>
                <p className="text-xs muted leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="surface-card p-8 grid gap-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to start scanning?
          </h2>
          <p className="text-sm muted">
            Install the CLI in under 30 seconds. No account required.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-1">
            <a href="https://scanrook.sh" className="btn-primary">
              Install CLI
            </a>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function TierCard({ tier }: { tier: Tier }) {
  const borderClass = tier.highlight
    ? "border-[color:var(--dg-accent)]"
    : "";

  return (
    <div className={`surface-card p-6 grid gap-5 content-start ${borderClass}`}>
      {tier.highlight && (
        <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-semibold">
          Most popular
        </div>
      )}
      <div className="grid gap-1">
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight">{tier.price}</span>
          {tier.priceDetail && (
            <span className="text-sm muted">/ {tier.priceDetail}</span>
          )}
        </div>
        <p className="text-xs muted">{tier.description}</p>
      </div>
      <div>
        {tier.ctaStyle === "primary" ? (
          <Link href={tier.ctaHref} className="btn-primary block text-center">
            {tier.cta}
          </Link>
        ) : tier.ctaHref.startsWith("mailto:") || tier.ctaHref.startsWith("http") ? (
          <a href={tier.ctaHref} className="btn-secondary block text-center">
            {tier.cta}
          </a>
        ) : (
          <Link href={tier.ctaHref} className="btn-secondary block text-center">
            {tier.cta}
          </Link>
        )}
      </div>
      <ul className="grid gap-2">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs">
            <svg
              className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
            >
              <path
                d="M2.5 7.5 5.5 10.5 11.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

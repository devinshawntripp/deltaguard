import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import PublicSiteShell from "@/components/PublicSiteShell";

export const metadata: Metadata = {
  title: `Pricing | ${APP_NAME}`,
  description:
    "ScanRook pricing: Free CLI, Developer, Team, and Enterprise plans for vulnerability scanning at every scale.",
  openGraph: {
    title: `Pricing | ${APP_NAME}`,
    description:
      "Compare ScanRook plans: Free CLI, Developer, Team, and Enterprise.",
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
    description: "Full CLI scanner. No account required.",
    cta: "Install CLI",
    ctaHref: "https://scanrook.sh",
    ctaStyle: "secondary",
    features: [
      "1 seat",
      "OSV + basic NVD enrichment",
      "Text output format",
      "CLI only",
      "25 scans / month",
      "Pre-compiled free vulnerability database",
      "No account required",
    ],
  },
  {
    name: "Developer",
    price: "$15",
    priceDetail: "per dev / month",
    description: "Enhanced enrichment and output formats for individual developers.",
    cta: "Start Free Trial",
    ctaHref: "/dashboard/billing",
    ctaStyle: "primary",
    features: [
      "1 seat",
      "Everything in Free, plus:",
      "Full NVD, EPSS, KEV enrichment",
      "JSON and NDJSON output formats",
      "Free vulndb access (db fetch)",
      "SBOM import, diff, and export",
      "100 scans / month",
    ],
  },
  {
    name: "Team",
    price: "$40",
    priceDetail: "per dev / month (min 5 seats)",
    description: "Dashboard, CI/CD, and registry scanning for teams of 5+.",
    cta: "Start Free Trial",
    ctaHref: "/dashboard/billing",
    ctaStyle: "primary",
    highlight: true,
    features: [
      "5 seats included ($40/dev for additional)",
      "Everything in Developer, plus:",
      "Full vulnerability database (OVAL, distro trackers)",
      "Web dashboard and scan history",
      "CI/CD integration (GitHub Action, policy gates)",
      "Docker registry connections with scheduled scans",
      "Slack, Discord, and webhook notifications",
      "License compliance and risk scoring",
      "Active contributor tracking",
      "Compliance reports (SOC 2, ISO 27001, FedRAMP)",
      "500 scans / month",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Self-hosted deployment with SSO, compliance, and dedicated support.",
    cta: "Contact Sales",
    ctaHref: "mailto:sales@scanrook.io",
    ctaStyle: "secondary",
    features: [
      "Unlimited seats",
      "Everything in Team, plus:",
      "SSO / SAML authentication",
      "Self-hosted Kubernetes deployment",
      "Audit logging with full-text search",
      "K8s cluster scanning and operator",
      "License obligation tracking",
      "Legal review workflow",
      "Unlimited scans",
      "Dedicated support and SLA",
    ],
  },
];

interface ComparisonFeature {
  name: string;
  free: string | boolean;
  developer: string | boolean;
  team: string | boolean;
  enterprise: string | boolean;
}

const comparisonFeatures: ComparisonFeature[] = [
  { name: "Seats", free: "1", developer: "1", team: "5 included", enterprise: "Unlimited" },
  { name: "Scans / month", free: "25", developer: "100", team: "500", enterprise: "Unlimited" },
  { name: "OSV enrichment", free: true, developer: true, team: true, enterprise: true },
  { name: "Basic NVD enrichment", free: true, developer: true, team: true, enterprise: true },
  { name: "Full NVD + EPSS + KEV enrichment", free: false, developer: true, team: true, enterprise: true },
  { name: "Text output", free: true, developer: true, team: true, enterprise: true },
  { name: "JSON / NDJSON output", free: false, developer: true, team: true, enterprise: true },
  { name: "Free vulndb access (db fetch)", free: false, developer: true, team: true, enterprise: true },
  { name: "SBOM import, diff, and export", free: false, developer: true, team: true, enterprise: true },
  { name: "Full vuln database (OVAL, distro trackers)", free: false, developer: false, team: true, enterprise: true },
  { name: "Web dashboard and scan history", free: false, developer: false, team: true, enterprise: true },
  { name: "CI/CD integration (GitHub Action, policy gates)", free: false, developer: false, team: true, enterprise: true },
  { name: "Docker registry connections with scheduled scans", free: false, developer: false, team: true, enterprise: true },
  { name: "Slack, Discord, and webhook notifications", free: false, developer: false, team: true, enterprise: true },
  { name: "License compliance and risk scoring", free: false, developer: false, team: true, enterprise: true },
  { name: "Active contributor tracking", free: false, developer: false, team: true, enterprise: true },
  { name: "Compliance reports (SOC 2, ISO 27001, FedRAMP)", free: false, developer: false, team: true, enterprise: true },
  { name: "SSO / SAML authentication", free: false, developer: false, team: false, enterprise: true },
  { name: "Self-hosted Kubernetes deployment", free: false, developer: false, team: false, enterprise: true },
  { name: "Audit logging with full-text search", free: false, developer: false, team: false, enterprise: true },
  { name: "K8s cluster scanning and operator", free: false, developer: false, team: false, enterprise: true },
  { name: "License obligation tracking", free: false, developer: false, team: false, enterprise: true },
  { name: "Legal review workflow", free: false, developer: false, team: false, enterprise: true },
  { name: "Support", free: "Community", developer: "Email", team: "Priority", enterprise: "Dedicated + SLA" },
];

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Do I need an account to use ScanRook?",
    answer:
      "No. The Free CLI scanner works without any login or account. You only need an account for Developer, Team, or Enterprise features.",
  },
  {
    question: "What's included in the free trial?",
    answer:
      "Developer and Team plans include a 14-day free trial with full access to all plan features. No credit card required to start.",
  },
  {
    question: "What's the minimum for the Team plan?",
    answer:
      "The Team plan requires a minimum of 5 developer seats at $40/dev/month. Additional seats can be added at any time.",
  },
  {
    question: "What artifacts can ScanRook scan?",
    answer:
      "Container image tars (Docker, OCI), source tarballs, ISO images, and compiled binaries (ELF, PE, Mach-O). The scanner also imports existing SBOMs in CycloneDX, SPDX, and Syft JSON formats.",
  },
  {
    question: "Is there a self-hosted option?",
    answer:
      "Yes. The Enterprise plan includes a Kubernetes-native deployment with all three services (UI, Worker, Scanner). Contact sales@scanrook.io for architecture details and deployment support.",
  },
  {
    question: "What data sources does ScanRook use?",
    answer:
      "OSV (Google Open Source Vulnerabilities), NVD (NIST National Vulnerability Database), Red Hat OVAL advisories, CISA KEV (Known Exploited Vulnerabilities), and FIRST.org EPSS (Exploit Prediction Scoring System).",
  },
  {
    question: "Can I upgrade or downgrade at any time?",
    answer:
      "Yes. You can change plans at any time from your billing dashboard. Upgrades take effect immediately and downgrades apply at the end of the current billing cycle.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ScanRook",
    description: "Vulnerability scanning platform with container, binary, and license scanning",
    brand: { "@type": "Brand", name: "ScanRook" },
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", description: "CLI scanning with OSV enrichment" },
      { "@type": "Offer", name: "Developer", price: "15", priceCurrency: "USD", unitText: "per developer per month" },
      { "@type": "Offer", name: "Team", price: "40", priceCurrency: "USD", unitText: "per developer per month, minimum 5 seats" },
      { "@type": "Offer", name: "Enterprise", price: "0", priceCurrency: "USD", description: "Custom pricing" },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <PublicSiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="mx-auto max-w-6xl px-6 py-14 grid gap-10">
        {/* Header */}
        <section className="surface-card p-8 grid gap-4">
          <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Pricing
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-sm muted max-w-3xl">
            Start scanning for free with the CLI. Add enrichment, team features,
            and enterprise controls as you grow. No per-scan fees.
          </p>
        </section>

        {/* Tiers */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </section>

        {/* Feature comparison table */}
        <section className="grid gap-4">
          <div className="surface-card p-6 grid gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Feature comparison
            </h2>
            <p className="text-sm muted">
              Detailed breakdown of what&apos;s included in each plan.
            </p>
          </div>
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left p-4 font-semibold text-sm">Feature</th>
                  <th className="text-center p-4 font-semibold text-sm">Free</th>
                  <th className="text-center p-4 font-semibold text-sm">Developer</th>
                  <th className="text-center p-4 font-semibold text-sm bg-emerald-500/5">Team</th>
                  <th className="text-center p-4 font-semibold text-sm">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature) => (
                  <tr
                    key={feature.name}
                    className="border-b border-black/5 dark:border-white/5 last:border-0"
                  >
                    <td className="p-4 text-xs">{feature.name}</td>
                    <ComparisonCell value={feature.free} />
                    <ComparisonCell value={feature.developer} />
                    <ComparisonCell value={feature.team} highlight />
                    <ComparisonCell value={feature.enterprise} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <Link href="/dashboard/billing" className="btn-secondary">
              View plans
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

function ComparisonCell({
  value,
  highlight,
}: {
  value: string | boolean;
  highlight?: boolean;
}) {
  const bgClass = highlight ? "bg-emerald-500/5" : "";

  if (typeof value === "boolean") {
    return (
      <td className={`text-center p-4 ${bgClass}`}>
        {value ? (
          <svg
            className="inline text-emerald-600 dark:text-emerald-400"
            width="16"
            height="16"
            viewBox="0 0 14 14"
            aria-label="Included"
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
        ) : (
          <span className="muted" aria-label="Not included">
            &mdash;
          </span>
        )}
      </td>
    );
  }

  return (
    <td className={`text-center p-4 text-xs ${bgClass}`}>{value}</td>
  );
}

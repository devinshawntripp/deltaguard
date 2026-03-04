import PublicSiteShell from "@/components/PublicSiteShell";
import DocsSidebarClient from "./DocsSidebarClient";

type NavItem = {
    href: string;
    label: string;
    children?: NavItem[];
};

const navItems: NavItem[] = [
    { href: "/docs", label: "Overview" },
    { href: "/docs/quickstart", label: "Quickstart" },
    { href: "/docs/cli-reference", label: "CLI Reference" },
    {
        href: "/docs/dashboard",
        label: "Dashboard",
        children: [
            { href: "/docs/dashboard/jobs-and-progress", label: "Jobs & Progress" },
            { href: "/docs/dashboard/findings-and-reports", label: "Findings & Reports" },
        ],
    },
    {
        href: "/docs/concepts",
        label: "Concepts",
        children: [
            { href: "/docs/concepts/cpe", label: "CPE" },
            { href: "/docs/concepts/enrichment", label: "Enrichment" },
            { href: "/docs/concepts/caching", label: "Caching" },
            { href: "/docs/concepts/confidence-tiers", label: "Confidence Tiers" },
            { href: "/docs/concepts/deep-scanning", label: "Deep Scanning" },
            { href: "/docs/concepts/compliance", label: "Compliance" },
            { href: "/docs/concepts/supply-chain-security", label: "Supply Chain Security" },
        ],
    },
    { href: "/docs/benchmarks", label: "Benchmarks" },
    { href: "/docs/self-hosted", label: "Self-Hosted" },
    { href: "/docs/data-sources", label: "Data Sources" },
    {
        href: "/docs/integrations",
        label: "Integrations",
        children: [
            { href: "/docs/integrations/github-actions", label: "GitHub Actions" },
            { href: "/docs/integrations/gitlab-ci", label: "GitLab CI" },
        ],
    },
];

const breadcrumbLabels: Record<string, string> = {
    docs: "Docs",
    quickstart: "Quickstart",
    "cli-reference": "CLI Reference",
    dashboard: "Dashboard",
    "jobs-and-progress": "Jobs & Progress",
    "findings-and-reports": "Findings & Reports",
    concepts: "Concepts",
    cpe: "CPE",
    enrichment: "Enrichment",
    caching: "Caching",
    "confidence-tiers": "Confidence Tiers",
    "deep-scanning": "Deep Scanning",
    compliance: "Compliance",
    "supply-chain-security": "Supply Chain Security",
    benchmarks: "Benchmarks",
    "self-hosted": "Self-Hosted",
    "data-sources": "Data Sources",
    integrations: "Integrations",
    "github-actions": "GitHub Actions",
    "gitlab-ci": "GitLab CI",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <PublicSiteShell>
            <main className="mx-auto max-w-[1400px] px-4 py-8">
                <DocsSidebarClient navItems={navItems} breadcrumbLabels={breadcrumbLabels}>
                    {children}
                </DocsSidebarClient>
            </main>
        </PublicSiteShell>
    );
}

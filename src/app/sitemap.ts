import type { MetadataRoute } from "next";
import { posts } from "@/lib/blogPosts";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://scanrook.io").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── Core pages ──
  const core: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/roadmap`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/security`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // ── Compare pages ──
  const compare: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/compare/trivy`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/compare/grype`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/compare/snyk`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // ── Docs pages ──
  const docsPaths = [
    "/docs",
    "/docs/quickstart",
    "/docs/cli-reference",
    "/docs/architecture",
    "/docs/benchmarks",
    "/docs/data-sources",
    "/docs/self-hosted",
    "/docs/faq",
    "/docs/changelog",
    "/docs/dashboard",
    "/docs/dashboard/jobs-and-progress",
    "/docs/dashboard/findings-and-reports",
    "/docs/concepts/enrichment",
    "/docs/concepts/confidence-tiers",
    "/docs/concepts/cpe",
    "/docs/concepts/caching",
    "/docs/concepts/deep-scanning",
    "/docs/concepts/compliance",
    "/docs/concepts/supply-chain-security",
    "/docs/concepts/scan-status",
    "/docs/concepts/vulnerability-database",
    "/docs/concepts/license-scanning",
    "/docs/concepts/license-types",
    "/docs/integrations/github-actions",
    "/docs/integrations/gitlab-ci",
  ];

  const docs: MetadataRoute.Sitemap = docsPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/docs" ? 0.9 : path.includes("/concepts/") ? 0.7 : 0.8,
  }));

  // ── Blog pages (dynamic from blogPosts.ts) ──
  const blog: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${baseUrl}${post.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...core, ...compare, ...docs, ...blog];
}

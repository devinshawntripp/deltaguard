import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import { posts, categoryColors } from "@/lib/blogPosts";

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

export default function BlogIndexPage() {
  const featured = posts.filter((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 grid gap-10">
      {/* Header */}
      <section className="surface-card p-8 grid gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">ScanRook Blog</h1>
        <p className="text-sm muted max-w-2xl">
          Educational articles on vulnerability scanning, CVE databases, exploit
          prediction, and container security.
        </p>
      </section>

      {/* Featured posts — larger cards in a responsive grid */}
      <section className="grid gap-5 md:grid-cols-3">
        {featured.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="group surface-card p-6 grid gap-3 content-start hover:border-[var(--dg-accent)] transition-colors"
          >
            <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${categoryColors[post.category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
              {post.category}
            </span>
            <h2 className="text-lg font-semibold tracking-tight group-hover:underline leading-snug">
              {post.title}
            </h2>
            <p className="text-xs muted leading-relaxed">{post.description}</p>
          </Link>
        ))}
      </section>

      {/* All posts — compact 2-column grid */}
      <section className="grid gap-4 sm:grid-cols-2">
        {rest.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="group rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[.03] p-5 grid gap-2.5 content-start hover:border-[var(--dg-accent)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${categoryColors[post.category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                {post.category}
              </span>
            </div>
            <h2 className="text-sm font-semibold tracking-tight group-hover:underline leading-snug">
              {post.title}
            </h2>
            <p className="text-xs muted leading-relaxed line-clamp-2">{post.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { posts } from "@/lib/blogPosts";

function BlogSidebar({ currentHref, mobile }: { currentHref: string; mobile?: boolean }) {
  return (
    <aside className={mobile ? "" : "hidden lg:block"}>
      <div className={`${mobile ? "" : "sticky top-24"} max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur p-4`}>
        <div className="text-xs uppercase tracking-wide muted mb-2">Blog Posts</div>
        <nav className="grid gap-1">
          {posts.map((p) => {
            const isActive = currentHref === p.href;
            return (
              <Link
                key={p.href}
                href={p.href}
                className={`block rounded-lg px-3 py-1.5 text-sm transition truncate ${
                  isActive
                    ? "font-semibold bg-[var(--dg-accent-soft)] border border-[color-mix(in_srgb,var(--dg-accent)_50%,var(--dg-border))]"
                    : "hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                }`}
                style={isActive ? { color: "var(--dg-accent-ink)" } : undefined}
              >
                {p.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function getRelatedPosts(currentHref: string, category: string) {
  return posts
    .filter((p) => p.category === category && p.href !== currentHref)
    .slice(0, 4);
}

export default function BlogLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isIndexPage = pathname === "/blog";
  const currentPost = posts.find((p) => p.href === pathname);

  if (isIndexPage || !currentPost) {
    return <>{children}</>;
  }

  const relatedPosts = getRelatedPosts(pathname, currentPost.category);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="text-sm muted mb-4 flex items-center gap-1.5">
        <Link href="/blog" className="hover:text-[var(--dg-accent)] transition-colors">Blog</Link>
        <span>/</span>
        <span className="truncate">{currentPost.title}</span>
      </nav>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {sidebarOpen ? "Hide posts" : "All posts"}
        </button>
      </div>
      {sidebarOpen && <div className="lg:hidden mb-4"><BlogSidebar currentHref={pathname} mobile /></div>}

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:items-start">
        <BlogSidebar currentHref={pathname} />
        <div className="min-w-0 blog-content-area">
          {children}
          {relatedPosts.length > 0 && (
            <section className="surface-card p-7 grid gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Related Posts</h2>
                <p className="text-xs muted mt-0.5">More on this topic.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedPosts.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-4 hover:border-[var(--dg-accent)] transition grid gap-1"
                  >
                    <span className="text-sm font-semibold">{p.title}</span>
                    <span className="text-xs muted">{p.description}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

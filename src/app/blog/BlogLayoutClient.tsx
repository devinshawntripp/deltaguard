"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { posts } from "@/lib/blogPosts";
import {
  BlogRelatedPostsMobile,
  BlogRelatedPostsDesktop,
} from "@/components/BlogRelatedPosts";

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

export default function BlogLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isIndexPage = pathname === "/blog";
  const currentPost = posts.find((p) => p.href === pathname);

  if (isIndexPage || !currentPost) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Mobile sidebar toggle + related posts */}
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
      <BlogRelatedPostsMobile currentHref={pathname} category={currentPost.category} />

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)_240px] lg:gap-10 lg:items-start mt-4 lg:mt-0">
        <BlogSidebar currentHref={pathname} />
        <div className="min-w-0 overflow-hidden">{children}</div>
        <BlogRelatedPostsDesktop currentHref={pathname} category={currentPost.category} />
      </div>
    </div>
  );
}

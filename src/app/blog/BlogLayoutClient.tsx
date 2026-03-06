"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { posts } from "@/lib/blogPosts";
import {
  BlogRelatedPostsMobile,
  BlogRelatedPostsDesktop,
} from "@/components/BlogRelatedPosts";

function BlogSidebar({ currentHref }: { currentHref: string }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur p-4">
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
  const isIndexPage = pathname === "/blog";
  const currentPost = posts.find((p) => p.href === pathname);

  if (isIndexPage || !currentPost) {
    return <>{children}</>;
  }

  return (
    <>
      <BlogRelatedPostsMobile currentHref={pathname} category={currentPost.category} />
      <div className="lg:max-w-7xl lg:mx-auto lg:px-6">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:gap-8 lg:items-start">
          <BlogSidebar currentHref={pathname} />
          <div className="min-w-0">{children}</div>
          <BlogRelatedPostsDesktop currentHref={pathname} category={currentPost.category} />
        </div>
      </div>
    </>
  );
}

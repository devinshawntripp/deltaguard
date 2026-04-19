"use client";

import { useState } from "react";
import Link from "next/link";
import { posts, categoryColors } from "@/lib/blogPosts";

interface BlogRelatedPostsProps {
  currentHref: string;
  category: string;
}

/** Shared list of related post links */
function RelatedPostList({
  related,
  category,
}: {
  related: ReturnType<typeof posts.filter>;
  category: string;
}) {
  const categoryColor =
    categoryColors[category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <>
      <span
        className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${categoryColor}`}
      >
        {category}
      </span>
      <nav className="grid gap-3">
        {related.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="group grid gap-1 hover:text-[var(--dg-accent)] transition-colors"
          >
            <span className="text-sm font-medium leading-snug group-hover:underline">
              {post.title}
            </span>
            <span className="text-xs muted leading-relaxed line-clamp-2">
              {post.description}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}

/**
 * Mobile accordion (shown on small screens, hidden at lg+).
 * Render this BEFORE the blog content for correct stacking order.
 */
export function BlogRelatedPostsMobile({ currentHref, category }: BlogRelatedPostsProps) {
  const [open, setOpen] = useState(false);

  const related = posts
    .filter((p) => p.category === category && p.href !== currentHref)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn-secondary inline-flex items-center gap-2 w-full justify-between"
      >
        <span>Related posts</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2.5 5L7 9.5L11.5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur p-4 grid gap-3">
          <RelatedPostList related={related} category={category} />
        </div>
      )}
    </div>
  );
}

/**
 * Desktop sticky sidebar (hidden below lg, always visible at lg+).
 * Render inside the right column of the two-column grid.
 */
export function BlogRelatedPostsDesktop({ currentHref, category }: BlogRelatedPostsProps) {
  const related = posts
    .filter((p) => p.category === category && p.href !== currentHref)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur p-4 grid gap-3">
        <div className="text-xs uppercase tracking-wide muted">Related posts</div>
        <RelatedPostList related={related} category={category} />
      </div>
    </aside>
  );
}

/**
 * Combined component for backward-compatibility.
 * Renders both mobile accordion and desktop sidebar.
 * Use BlogRelatedPostsMobile + BlogRelatedPostsDesktop separately for layout control.
 */
export default function BlogRelatedPosts({ currentHref, category }: BlogRelatedPostsProps) {
  const related = posts
    .filter((p) => p.category === category && p.href !== currentHref)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <>
      <BlogRelatedPostsMobile currentHref={currentHref} category={category} />
      <BlogRelatedPostsDesktop currentHref={currentHref} category={category} />
    </>
  );
}

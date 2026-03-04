---
phase: 07-testing-docs-benchmarks
plan: 03
subsystem: blog-ui
tags: [blog, sidebar, content-discovery, related-posts, react, tailwind]
dependency_graph:
  requires: []
  provides: [shared-blog-posts-data, blog-related-posts-sidebar]
  affects: [blog-index-page, blog-post-pages]
tech_stack:
  added: []
  patterns: [client-component-usePathname, sticky-sidebar, mobile-accordion, split-export-components]
key_files:
  created:
    - src/lib/blogPosts.ts
    - src/components/BlogRelatedPosts.tsx
    - src/app/blog/BlogLayoutClient.tsx
  modified:
    - src/app/blog/page.tsx
    - src/app/blog/layout.tsx
decisions:
  - "Split BlogRelatedPosts into BlogRelatedPostsMobile and BlogRelatedPostsDesktop named exports for layout control — avoids double-rendering and DOM order issues"
  - "BlogLayoutClient uses usePathname() to look up current post category from shared posts array — avoids prop drilling through individual page components"
  - "Mobile accordion renders above content using DOM order (before children), desktop sidebar in right column of lg grid — no CSS order tricks needed"
  - "categoryColors extracted from blog/page.tsx into blogPosts.ts to eliminate duplication between index and sidebar pill"
metrics:
  duration: 5 min
  completed: 2026-03-04
  tasks: 2
  files_modified: 5
---

# Phase 7 Plan 03: Blog Related Posts Sidebar Summary

**One-liner:** Blog post pages now show a related-content sidebar (up to 3 posts, same category) using a shared data source, client-side pathname detection, mobile accordion, and a desktop sticky sidebar.

## What Was Built

### Task 1: Extract shared posts data + create BlogRelatedPosts component

**Commits:** 5a49ad0

Created `src/lib/blogPosts.ts` as a single source of truth for the blog posts array. Extracted both the `posts` array and the `categoryColors` map that were previously inline in `blog/page.tsx`. The blog index page now imports from this shared module and renders identically.

Created `src/components/BlogRelatedPosts.tsx` as a `"use client"` component with three exports:
- `BlogRelatedPostsMobile` — mobile-only accordion toggle (hidden at `lg+`)
- `BlogRelatedPostsDesktop` — desktop-only sticky aside (hidden below `lg`)
- `BlogRelatedPosts` (default) — combined wrapper for backward compatibility

Filtering logic: same category, different href, max 3 posts. Returns null if no related posts found.

### Task 2: Wire BlogRelatedPosts into blog post pages via layout

**Commits:** 2b8ce18

Updated `src/app/blog/layout.tsx` to delegate rendering to a new `BlogLayoutClient.tsx` client component (the layout itself remains a server component wrapping `PublicSiteShell`).

`BlogLayoutClient` uses `usePathname()` to determine the current route and looks up the post in the shared `posts` array to get its category. Logic:
- `/blog` index page → renders `{children}` unchanged, no sidebar
- Unknown path (not in posts array) → renders `{children}` unchanged
- Individual post page → renders mobile accordion above content, then a two-column `lg:grid` with content left and desktop sidebar right

The two-column grid uses `lg:grid-cols-[minmax(0,1fr)_240px]` matching the established docs sidebar pattern from Phase 2.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Design] Split BlogRelatedPosts into named mobile/desktop exports**
- **Found during:** Task 2
- **Issue:** A single combined BlogRelatedPosts component rendered inside a grid column would cause DOM ordering issues — the mobile accordion would appear below the blog content on mobile (since grid stacks vertically), but we need it above.
- **Fix:** Split into `BlogRelatedPostsMobile` (renders before `{children}`) and `BlogRelatedPostsDesktop` (renders in the grid right column). BlogLayoutClient uses both separately to control DOM order.
- **Files modified:** src/components/BlogRelatedPosts.tsx, src/app/blog/BlogLayoutClient.tsx
- **Commit:** 2b8ce18

**2. [Rule 2 - Enhancement] Extracted categoryColors to shared module**
- **Found during:** Task 1
- **Issue:** categoryColors map was defined inline in blog/page.tsx and would need to be duplicated for the sidebar pill.
- **Fix:** Moved categoryColors into blogPosts.ts and exported it alongside posts and BlogPost type.
- **Files modified:** src/lib/blogPosts.ts, src/app/blog/page.tsx
- **Commit:** 5a49ad0

## Verification

- `npx next build` succeeds (compiled successfully, 57/57 pages generated)
- Blog index page (`/blog`) renders all posts — imports from shared blogPosts.ts
- Individual blog post pages show BlogRelatedPosts sidebar via BlogLayoutClient
- Mobile: accordion toggle with chevron animation, collapsible panel
- Desktop: sticky sidebar at `top-24`, `rounded-2xl border`, `p-4` matching docs sidebar
- Blog index page does NOT show sidebar (pathname === '/blog' check)

## Self-Check

## Self-Check: PASSED

All key files confirmed on disk:
- FOUND: src/lib/blogPosts.ts
- FOUND: src/components/BlogRelatedPosts.tsx
- FOUND: src/app/blog/BlogLayoutClient.tsx

All commits confirmed in git log:
- 5a49ad0: feat(07-03): extract shared blog posts data and create BlogRelatedPosts component
- 2b8ce18: feat(07-03): wire BlogRelatedPosts into blog post pages via layout

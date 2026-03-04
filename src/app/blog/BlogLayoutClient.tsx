"use client";

import { usePathname } from "next/navigation";
import { posts } from "@/lib/blogPosts";
import {
  BlogRelatedPostsMobile,
  BlogRelatedPostsDesktop,
} from "@/components/BlogRelatedPosts";

export default function BlogLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIndexPage = pathname === "/blog";
  const currentPost = posts.find((p) => p.href === pathname);

  // Index page or unknown post — render children unchanged
  if (isIndexPage || !currentPost) {
    return <>{children}</>;
  }

  // Individual post page:
  // 1. Mobile accordion appears above content (BlogRelatedPostsMobile — lg:hidden)
  // 2. Two-column grid at lg+: content left, sticky sidebar right
  return (
    <>
      {/* Mobile: accordion toggle above the content */}
      <BlogRelatedPostsMobile currentHref={pathname} category={currentPost.category} />

      {/* Two-column grid at lg: blog content + desktop sidebar */}
      <div className="lg:max-w-6xl lg:mx-auto lg:px-6">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-10 lg:items-start">
          <div className="min-w-0">{children}</div>
          <BlogRelatedPostsDesktop currentHref={pathname} category={currentPost.category} />
        </div>
      </div>
    </>
  );
}

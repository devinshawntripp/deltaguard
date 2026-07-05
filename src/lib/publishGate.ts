import { posts, type BlogPost } from "./blogPosts";

export function isPublished(
  post: Pick<BlogPost, "publishDate">,
  now: Date = new Date()
): boolean {
  if (!post.publishDate) return true;
  return post.publishDate <= now.toISOString().slice(0, 10);
}

export function visiblePosts(now: Date = new Date()): BlogPost[] {
  return posts.filter((p) => isPublished(p, now));
}

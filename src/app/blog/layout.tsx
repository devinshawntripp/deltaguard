import PublicSiteShell from "@/components/PublicSiteShell";
import BlogLayoutClient from "./BlogLayoutClient";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicSiteShell>
      <BlogLayoutClient>{children}</BlogLayoutClient>
    </PublicSiteShell>
  );
}

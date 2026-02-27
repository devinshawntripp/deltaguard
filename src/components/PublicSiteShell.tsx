import type { ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { APP_NAME } from "@/lib/brand";

export default function PublicSiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/" className="app-brand">
            <BrandLogo />
          </Link>
          <nav className="app-nav">
            <Link href="/" className="app-nav-link">Home</Link>
            <Link href="/docs" className="app-nav-link">Docs</Link>
            <Link href="/roadmap" className="app-nav-link">Roadmap</Link>
            <Link href="/blog" className="app-nav-link">Blog</Link>
            <a href="https://scanrook.sh" className="app-nav-link">Install</a>
            <ThemeToggle />
            <Link href="/signin" className="btn-secondary">Sign in</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="app-footer">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2">
            <BrandLogo compact />
            <span>{APP_NAME}</span>
          </span>
          <span>Installed-state-first vulnerability scanning</span>
          <span className="inline-flex gap-2">
            <Link href="/docs" className="app-nav-link">Docs</Link>
            <Link href="/roadmap" className="app-nav-link">Roadmap</Link>
            <Link href="/blog" className="app-nav-link">Blog</Link>
            <a href="https://scanrook.sh" className="app-nav-link">CLI</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SignOutButton from "@/components/SignOutButton";
import AuthExpiredOverlay from "@/components/AuthExpiredOverlay";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import { APP_NAME } from "@/lib/brand";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.revoked) {
    redirect("/signin");
  }

  const email = session.user.email || "unknown";
  const rolesMask = session.roles_mask || session.user.roles_mask || "0";
  const isAdminOverride = String(rolesMask) === "9223372036854775807";

  return (
    <div className="app-shell">
      <AuthExpiredOverlay />
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/dashboard" className="app-brand">
            <BrandLogo />
          </Link>
          <nav className="app-nav">
            <Link href="/dashboard" className="app-nav-link">Dashboard</Link>
            <Link href="/dashboard/settings/scanner" className="app-nav-link">Scanner</Link>
            <Link href="/dashboard/settings/org" className="app-nav-link">Org</Link>
            {isAdminOverride ? <Link href="/dashboard/settings/admin" className="app-nav-link">Master Admin</Link> : null}
            <Link href="/dashboard/settings/api-keys" className="app-nav-link">API Keys</Link>
            <Link href="/dashboard/settings/api-docs" className="app-nav-link">API Docs</Link>
            <Link href="/docs" className="app-nav-link">Docs</Link>
            <Link href="/dashboard/settings/billing" className="app-nav-link">Billing</Link>
            <ThemeToggle />
            <span className="muted max-w-[220px] truncate text-xs">{email}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div className="inline-flex items-center gap-2">
          <BrandLogo compact />
          <span>{APP_NAME} • Installed-state-first vulnerability workflow</span>
        </div>
      </footer>
    </div>
  );
}

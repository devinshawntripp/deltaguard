import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import AuthExpiredOverlay from "@/components/AuthExpiredOverlay";
import BrandLogo from "@/components/BrandLogo";
import { APP_NAME } from "@/lib/brand";
import UploadIndicator from "@/components/UploadIndicator";
import DashboardNavClient from "@/components/DashboardNavClient";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.revoked) {
    const hdrs = await headers();
    const pathname = hdrs.get("x-invoke-path") || hdrs.get("x-next-url") || "/dashboard";
    redirect(`/signin?next=${encodeURIComponent(pathname)}`);
  }

  const email = session.user.email || "unknown";
  const rolesMask = session.roles_mask || session.user.roles_mask || "0";
  const isAdminOverride = String(rolesMask) === "9223372036854775807";

  return (
    <div className="app-shell">
      <AuthExpiredOverlay />
      <header className="app-header">
        <div className="app-header-inner flex-wrap">
          <Link href="/dashboard" className="app-brand">
            <BrandLogo />
          </Link>
          <DashboardNavClient email={email} isAdminOverride={isAdminOverride} />
        </div>
      </header>
      <main className="app-main">{children}</main>
      <UploadIndicator />
      <footer className="app-footer">
        <div className="inline-flex items-center gap-2">
          <BrandLogo compact />
          <span>{APP_NAME} • Installed-state-first vulnerability workflow</span>
        </div>
      </footer>
    </div>
  );
}

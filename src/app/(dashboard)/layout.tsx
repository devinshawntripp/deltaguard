import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import AuthExpiredOverlay from "@/components/AuthExpiredOverlay";
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
    <div className="app-shell-sidebar">
      <AuthExpiredOverlay />
      <DashboardNavClient email={email} isAdminOverride={isAdminOverride} />
      <div className="app-content-area">
        <main className="app-main-sidebar">{children}</main>
        <UploadIndicator />
        <footer className="app-footer-sidebar">
          <span>{APP_NAME}</span>
          <span className="text-[10px] opacity-40 ml-auto flex gap-3">
            <span>v{process.env.npm_package_version || process.env.APP_VERSION || "1.17.3"}</span>
            <span>{process.env.HOSTNAME || "local"}</span>
            <span>{process.env.NODE_NAME || "—"}</span>
          </span>
        </footer>
      </div>
    </div>
  );
}

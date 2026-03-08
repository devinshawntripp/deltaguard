import { Suspense } from "react";
import PackagesTable from "@/components/PackagesTable";
import UploadCard from "@/components/UploadCard";
import PublicImageScan from "@/components/PublicImageScan";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getOrgName(orgId: string): Promise<string | null> {
  await ensurePlatformSchema();
  const rows = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM orgs WHERE id=${orgId}::uuid LIMIT 1
  `;
  return rows[0]?.name || null;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.org_id || session?.user?.org_id;
  const orgName = orgId ? await getOrgName(orgId) : null;

  return (
    <div className="grid gap-8">
      <div className="grid gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Security Scans</h1>
          {orgName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--dg-accent-soft)] text-[var(--dg-accent-ink)] border border-[color-mix(in_srgb,var(--dg-accent)_40%,var(--dg-border))]">
              {orgName}
            </span>
          )}
        </div>
        <p className="muted text-sm">Queue artifacts, inspect workflow stages, and triage findings quickly.</p>
      </div>
      <PublicImageScan />
      <UploadCard />
      <Suspense fallback={<div className="opacity-60">Loading packages…</div>}>
        <PackagesTable />
      </Suspense>
    </div>
  );
}

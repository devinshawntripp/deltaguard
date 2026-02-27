import { Suspense } from "react";
import PackagesTable from "@/components/PackagesTable";
import UploadCard from "@/components/UploadCard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Security Scans</h1>
        <p className="muted text-sm">Queue artifacts, inspect workflow stages, and triage findings quickly.</p>
      </div>
      <UploadCard />
      <Suspense fallback={<div className="opacity-60">Loading packages…</div>}>
        <PackagesTable />
      </Suspense>
    </div>
  );
}


import Link from "next/link";
import JobFilesTree from "@/components/JobFilesTree";
import JobPackagesTable from "@/components/JobPackagesTable";

export default async function JobFilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "filesystem" } = await searchParams;
  const activeTab = tab === "packages" ? "packages" : "filesystem";

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">File Tree for {id}</h1>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/${id}/findings`} className="btn-secondary text-sm">Findings</Link>
          <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Dashboard
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/dashboard/${id}/files?tab=filesystem`}
          className={`px-3 py-1 rounded border transition-colors ${activeTab === "filesystem" ? "bg-[var(--dg-accent)] text-white border-[var(--dg-accent)]" : "border-[var(--dg-border)] hover:border-[var(--dg-border-strong)]"}`}
        >
          Everything
        </Link>
        <Link
          href={`/dashboard/${id}/files?tab=packages`}
          className={`px-3 py-1 rounded border transition-colors ${activeTab === "packages" ? "bg-[var(--dg-accent)] text-white border-[var(--dg-accent)]" : "border-[var(--dg-border)] hover:border-[var(--dg-border-strong)]"}`}
        >
          Packages + versions + paths
        </Link>
      </div>
      <div className="text-xs opacity-75">
        `Everything` shows full extracted filesystem entries. `Packages + versions + paths` shows discovered packages,
        their versions, and where they were found when path evidence is available.
      </div>

      {activeTab === "filesystem" ? <JobFilesTree jobId={id} /> : <JobPackagesTable jobId={id} />}
    </div>
  );
}

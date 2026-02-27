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
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/dashboard/${id}/findings`} className="underline">Findings</Link>
          <Link href="/dashboard" className="underline">Back to dashboard</Link>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/dashboard/${id}/files?tab=filesystem`}
          className={`px-3 py-1 rounded border ${activeTab === "filesystem" ? "bg-black text-white border-black" : "border-black/20 dark:border-white/20"}`}
        >
          Everything
        </Link>
        <Link
          href={`/dashboard/${id}/files?tab=packages`}
          className={`px-3 py-1 rounded border ${activeTab === "packages" ? "bg-black text-white border-black" : "border-black/20 dark:border-white/20"}`}
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

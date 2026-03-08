import JobActions from "@/components/JobActions";
import Link from "next/link";
import { notFound } from "next/navigation";
import JobDetailTabs from "@/components/JobDetailTabs";
import { getJob } from "@/lib/jobs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

export default async function PackageDetails({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const orgId = session?.org_id || session?.user?.org_id;
    if (!session?.user?.id || !orgId) {
        notFound();
    }

    const { id } = await params;
    const data = await getJob(id, orgId);
    if (!data) {
        return (
            <div className="grid gap-4">
                <div className="muted">Job not found.</div>
                <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-1.5 w-fit text-sm">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Back to dashboard
                </Link>
            </div>
        );
    }

    const summaryOnly = data.settings_snapshot?.summary_only === true;

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Back
                </Link>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/${id}/logs`} className="btn-secondary text-sm">Logs</Link>
                    {!summaryOnly && (
                        <>
                            <Link href={`/dashboard/${id}/findings`} className="btn-secondary text-sm">Findings</Link>
                            <Link href={`/dashboard/${id}/files`} className="btn-secondary text-sm">File tree</Link>
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Job {data.id}</h1>
                <div className="flex items-center gap-3">
                    <JobActions jobId={data.id} status={data.status} />
                </div>
            </div>
            <JobDetailTabs
                scanId={id}
                jobStatus={data.status}
                summaryJson={data.summary_json}
                startedAt={data.started_at}
                finishedAt={data.finished_at}
                displayName={data.object_key?.replace(/^\d+_/, "") || id}
                progressPct={data.progress_pct}
                progressMsg={data.progress_msg}
                sbomStatus={data.sbom_status}
            />
        </div>
    );
}

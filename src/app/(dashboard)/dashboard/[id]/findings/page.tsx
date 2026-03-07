import Link from "next/link";
import JobFindings from "@/components/JobFindings";
import ProgressGraph from "@/components/ProgressGraph";
import { getJob } from "@/lib/jobs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

function stripTimestampPrefix(key: string): string {
    // object_key format: "{timestamp}_{filename}" e.g. "1772900626103_centos-7.tar"
    const match = key.match(/^\d+_(.+)$/);
    return match ? match[1] : key;
}

export default async function JobFindingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const orgId = session?.org_id || session?.user?.org_id;
    const job = orgId ? await getJob(id, orgId) : null;

    const displayName = job?.object_key
        ? stripTimestampPrefix(job.object_key.split("/").pop() || job.object_key)
        : id;

    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Findings for {displayName}</h1>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/${id}/files`} className="btn-secondary text-sm">File tree</Link>
                    <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Dashboard
                    </Link>
                </div>
            </div>
            <div className="grid gap-2">
                <div className="text-sm font-medium">Workflow</div>
                <ProgressGraph scanId={id} eventsPath={`/api/jobs/${id}/events`} mode="list" />
            </div>
            <JobFindings jobId={id} />
        </div>
    );
}

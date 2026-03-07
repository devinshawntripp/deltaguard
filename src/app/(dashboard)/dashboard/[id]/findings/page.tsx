import Link from "next/link";
import JobFindings from "@/components/JobFindings";
import ProgressGraph from "@/components/ProgressGraph";

export default async function JobFindingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Findings for {id}</h1>
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

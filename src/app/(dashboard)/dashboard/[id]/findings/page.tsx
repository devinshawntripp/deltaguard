import Link from "next/link";
import JobFindings from "@/components/JobFindings";
import ProgressGraph from "@/components/ProgressGraph";

export default async function JobFindingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Findings for {id}</h1>
                <Link href="/dashboard" className="text-sm underline">Back to dashboard</Link>
            </div>
            <div className="grid gap-2">
                <div className="text-sm font-medium">Workflow</div>
                <ProgressGraph scanId={id} eventsPath={`/api/jobs/${id}/events`} mode="list" />
            </div>
            <JobFindings jobId={id} />
        </div>
    );
}



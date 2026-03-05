import Link from "next/link";
import { notFound } from "next/navigation";
import JobLiveStatus from "@/components/JobLiveStatus";
import LogViewerSection from "./LogViewerSection";
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
                <Link href="/dashboard" className="text-sm underline">Back to dashboard</Link>
            </div>
        );
    }
    return (
        <div className="grid gap-6">
            <LogViewerSection scanId={id} />
            <div className="flex items-center justify-between">
                <Link href="/dashboard" className="text-sm underline">← Back</Link>
                <div className="flex items-center gap-3 text-sm">
                    <Link href={`/dashboard/${id}/logs`} className="underline">Logs</Link>
                    <Link href={`/dashboard/${id}/findings`} className="underline">Findings</Link>
                    <Link href={`/dashboard/${id}/files`} className="underline">File tree</Link>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Job {data.id}</h1>
                <span className="text-sm muted">Live status</span>
            </div>
            <JobLiveStatus
                initial={{
                    id: data.id,
                    status: data.status,
                    progress_pct: data.progress_pct,
                    progress_msg: data.progress_msg,
                    created_at: data.created_at,
                    started_at: data.started_at,
                    finished_at: data.finished_at,
                    scan_status: data.scan_status,
                    inventory_status: data.inventory_status,
                    inventory_reason: data.inventory_reason,
                    error_msg: data.error_msg,
                }}
            />
            {data.summary_json && (
                <pre className="surface-card p-3 text-sm whitespace-pre-wrap">{JSON.stringify(data.summary_json, null, 2)}</pre>
            )}
        </div>
    );
}

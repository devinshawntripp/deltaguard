import Link from "next/link";
import ProgressGraph from "@/components/ProgressGraph";

async function getData(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/jobs/${id}`, { cache: "no-store" });
    if (!res.ok) return null; return res.json();
}

export default async function PackageDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getData(id);
    if (!data) {
        return (
            <div className="grid gap-4">
                <div className="opacity-80">Job not found.</div>
                <Link href="/dashboard" className="text-sm underline">Back to dashboard</Link>
            </div>
        );
    }
    return (
        <div className="grid gap-6">
            <div className="grid gap-2">
                <div className="font-medium">Workflow</div>
                <ProgressGraph scanId={id} eventsPath={`/api/jobs/${id}/events`} />
            </div>
            <div>
                <Link href="/dashboard" className="text-sm underline">← Back</Link>
            </div>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Job {data.id}</h1>
                <span className="text-sm opacity-70">{data.status} • {data.progress_pct}%</span>
            </div>
            <div className="grid gap-2 text-sm">
                <div>Created: {data.created_at ? new Date(data.created_at).toLocaleString() : ""}</div>
                {data.started_at && <div>Started: {new Date(data.started_at).toLocaleString()}</div>}
                {data.finished_at && <div>Finished: {new Date(data.finished_at).toLocaleString()}</div>}
                {data.progress_msg && <div className="opacity-80">{data.progress_msg}</div>}
            </div>
            {data.summary_json && (
                <pre className="rounded-md border border-black/10 dark:border-white/10 p-3 text-sm whitespace-pre-wrap">{JSON.stringify(data.summary_json, null, 2)}</pre>
            )}
        </div>
    );
}





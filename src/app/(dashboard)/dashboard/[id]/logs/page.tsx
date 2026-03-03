import Link from "next/link";
import ProgressGraph from "@/components/ProgressGraph";

export default async function JobLogsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Logs for {id}</h1>
                <div className="flex items-center gap-3 text-sm">
                    <Link href={`/dashboard/${id}/findings`} className="underline">Findings</Link>
                    <Link href={`/dashboard/${id}/files`} className="underline">File tree</Link>
                    <Link href={`/dashboard/${id}`} className="underline">Back to job</Link>
                </div>
            </div>
            <ProgressGraph scanId={id} eventsPath={`/api/jobs/${id}/events`} mode="list" height="viewport" />
        </div>
    );
}

"use client";

import React from "react";

type JobStatus = "queued" | "running" | "done" | "failed" | "deleting";

type JobState = {
    id: string;
    status: JobStatus;
    progress_pct: number;
    progress_msg?: string | null;
    created_at: string;
    started_at?: string | null;
    finished_at?: string | null;
    scan_status?: string | null;
    inventory_status?: string | null;
    inventory_reason?: string | null;
};

const STATUS_RANK: Record<JobStatus, number> = {
    queued: 0,
    running: 1,
    done: 2,
    failed: 2,
    deleting: 3,
};

function mergeMonotonic(cur: JobState, next: Partial<JobState>): JobState {
    const merged = { ...cur, ...next };
    const curRank = STATUS_RANK[cur.status];
    const nextRank = STATUS_RANK[merged.status];
    if (nextRank < curRank) {
        merged.status = cur.status;
    }
    merged.progress_pct = Math.max(cur.progress_pct || 0, merged.progress_pct || 0);
    if (!merged.progress_msg) merged.progress_msg = cur.progress_msg;
    return merged;
}

export default function JobLiveStatus({ initial }: { initial: JobState }) {
    const [job, setJob] = React.useState<JobState>(initial);

    React.useEffect(() => {
        const isActive = job.status === "queued" || job.status === "running";
        if (!isActive) return;

        const es = new EventSource("/api/jobs/events");
        es.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data);
                if (msg.type === "changed" && msg.item && msg.item.id === job.id) {
                    setJob((cur) => mergeMonotonic(cur, msg.item));
                }
                if (msg.type === "snapshot" && Array.isArray(msg.items)) {
                    const match = msg.items.find((x: any) => x.id === job.id);
                    if (match) setJob((cur) => mergeMonotonic(cur, match));
                }
            } catch { }
        };
        es.onerror = () => es.close();
        return () => es.close();
    }, [job.id, job.status]);

    return (
        <div className="grid gap-2 text-sm">
            <div className="font-semibold">{job.status} • {job.progress_pct}%</div>
            <div>Created: {job.created_at ? new Date(job.created_at).toLocaleString() : ""}</div>
            {job.started_at && <div>Started: {new Date(job.started_at).toLocaleString()}</div>}
            {job.finished_at && <div>Finished: {new Date(job.finished_at).toLocaleString()}</div>}
            {job.progress_msg && <div className="opacity-80">{job.progress_msg}</div>}
            {job.scan_status && <div className="opacity-80">scan_status: {job.scan_status}</div>}
            {job.inventory_status && <div className="opacity-80">inventory_status: {job.inventory_status}</div>}
            {job.inventory_reason && <div className="opacity-80">inventory_reason: {job.inventory_reason}</div>}
        </div>
    );
}

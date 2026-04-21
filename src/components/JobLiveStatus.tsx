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
    error_msg?: string | null;
};

const STATUS_RANK: Record<JobStatus, number> = {
    queued: 0,
    running: 1,
    done: 2,
    failed: 2,
    deleting: 3,
};

const STAGE_LABELS: Record<string, string> = {
    "queued": "Waiting in queue...",
    "claimed": "Worker claimed job",
    "s3_download": "Downloading artifact from S3...",
    "scanner_start": "Starting scanner...",
    "extract": "Extracting archive contents...",
    "inventory": "Detecting packages...",
    "osv": "Checking OSV vulnerability database...",
    "debian_tracker": "Checking distro security trackers...",
    "nvd": "Enriching findings with NVD severity data...",
    "redhat": "Checking Red Hat OVAL advisories...",
    "epss": "Adding exploit probability scores (EPSS)...",
    "kev": "Flagging actively exploited CVEs (CISA KEV)...",
    "ingest": "Saving findings to database...",
    "report_upload": "Generating report...",
    "complete": "Scan complete — processing results...",
    "failed": "Scan failed",
};

function humanizeProgress(msg: string | null | undefined, scanStatus: string | null | undefined): string | null {
    if (!msg && !scanStatus) return null;

    const raw = scanStatus || msg || "";
    const lower = raw.toLowerCase().trim();

    if (STAGE_LABELS[lower]) return STAGE_LABELS[lower];

    if (lower.startsWith("container.extract") || lower.startsWith("iso.extract") || lower.startsWith("archive.extract")) return "Extracting archive contents...";
    if (lower.startsWith("container.layers") || lower.startsWith("iso.squashfs")) return "Extracting filesystem layers...";
    if (lower.includes("pulling") || lower.includes("image.pull") || lower.startsWith("scan.image")) return "Pulling image...";
    if (lower.includes("rpmdb") || lower.startsWith("container.packages") || lower.startsWith("container.rpm") || lower.startsWith("iso.packages")) return "Detecting packages...";
    if (lower.startsWith("container.go.") || lower.startsWith("container.filename.")) return "Detecting packages...";
    if (lower.startsWith("inventory") || lower.startsWith("binary.")) return "Detecting packages...";
    if (lower.startsWith("osv.query.")) return "Querying OSV vulnerability database...";
    if (lower.startsWith("osv.apply.") || lower.startsWith("osv.enrich.")) return "Matching advisories to packages...";
    if (lower.startsWith("osv.") || lower.startsWith("container.osv") || lower.startsWith("container.enrich.osv")) return "Checking OSV vulnerability database...";
    if (lower.startsWith("nvd.enrich.cache")) return "Looking up CVE details from cache...";
    if (lower.startsWith("nvd.fetch.")) return "Fetching CVE details from NVD...";
    if (lower.startsWith("nvd.") || lower.startsWith("container.enrich.nvd") || lower.startsWith("binary.nvd")) return "Enriching findings with NVD severity data...";
    if (lower.startsWith("redhat.") || lower.startsWith("rh.") || lower.startsWith("oval.") || lower.startsWith("container.enrich.redhat")) return "Checking Red Hat OVAL advisories...";
    if (lower.startsWith("debian") || lower.startsWith("distro.")) return "Checking distro security trackers...";
    if (lower.startsWith("epss.")) return "Adding exploit probability scores (EPSS)...";
    if (lower.startsWith("kev.") || lower.startsWith("cisa.kev")) return "Flagging actively exploited CVEs (CISA KEV)...";
    if (lower.startsWith("worker.claim") || lower === "worker.start") return "Worker claimed job";
    if (lower.startsWith("s3.download")) return "Downloading artifact from S3...";
    if (lower.startsWith("worker.ingest") || lower.startsWith("ingest.")) return "Ingesting results into database...";
    if (lower.startsWith("worker.report") || lower.startsWith("report.upload") || lower.startsWith("s3.report")) return "Uploading report to S3...";
    if (lower === "scan.done" || lower === "scan.summary") return "Scan complete";

    return raw;
}

function formatEta(seconds: number): string {
    if (seconds < 60) return `<1m remaining`;
    const mins = Math.round(seconds / 60);
    return `~${mins}m remaining`;
}

function mergeMonotonic(cur: JobState, next: Partial<JobState>): JobState {
    const merged = { ...cur, ...next };
    const curRank = STATUS_RANK[cur.status];
    const nextRank = STATUS_RANK[merged.status];
    if (nextRank < curRank) {
        merged.status = cur.status;
    }
    merged.progress_pct = Math.max(cur.progress_pct || 0, merged.progress_pct || 0);
    if (!merged.progress_msg) merged.progress_msg = cur.progress_msg;
    if (!merged.error_msg) merged.error_msg = cur.error_msg;
    return merged;
}

function StatusBadge({ status }: { status: JobStatus }) {
    const styles: Record<JobStatus, string> = {
        queued: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
        running: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        done: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        deleting: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status]}`}>
            {status}
        </span>
    );
}

function useEta(startedAt: string | null | undefined, progressPct: number, isActive: boolean): string | null {
    const [now, setNow] = React.useState(Date.now());

    React.useEffect(() => {
        if (!isActive) return;
        const id = setInterval(() => setNow(Date.now()), 5000);
        return () => clearInterval(id);
    }, [isActive]);

    if (!isActive || !startedAt || progressPct <= 5 || progressPct >= 100) return null;

    const elapsed = (now - new Date(startedAt).getTime()) / 1000;
    if (elapsed < 10) return null;

    const totalEstimate = elapsed / (progressPct / 100);
    const remaining = totalEstimate - elapsed;

    if (remaining < 5) return null;
    return formatEta(remaining);
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

    const humanStage = humanizeProgress(job.progress_msg, job.scan_status);
    const isActive = job.status === "queued" || job.status === "running";
    const eta = useEta(job.started_at, job.progress_pct, isActive);

    return (
        <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3">
                <StatusBadge status={job.status} />
                <span className="font-semibold">{job.progress_pct}%</span>
                {eta && (
                    <span className="text-xs muted">{eta}</span>
                )}
            </div>
            {isActive && (
                <div className="w-full h-2 rounded bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                        className="h-2 rounded bg-blue-600 transition-[width] duration-700 ease-out"
                        style={{ width: `${Math.min(100, job.progress_pct)}%` }}
                    />
                </div>
            )}
            {isActive && humanStage && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">{humanStage}</span>
                </div>
            )}
            {!isActive && humanStage && job.status !== "failed" && (
                <div className="opacity-80">{humanStage}</div>
            )}
            <div className="grid gap-1 text-xs muted">
                <div>Created: {job.created_at ? new Date(job.created_at).toLocaleString() : ""}</div>
                {job.started_at && <div>Started: {new Date(job.started_at).toLocaleString()}</div>}
                {job.finished_at && <div>Finished: {new Date(job.finished_at).toLocaleString()}</div>}
            </div>
            {job.status === "failed" && job.error_msg && (
                <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-red-800 dark:text-red-200">
                    <span className="font-medium">Error:</span> {job.error_msg}
                </div>
            )}
        </div>
    );
}

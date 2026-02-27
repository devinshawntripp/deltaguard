export const WORKFLOW_STAGE_ORDER = [
    "queued",
    "claimed",
    "s3_download",
    "scanner_start",
    "extract",
    "inventory",
    "osv",
    "nvd",
    "redhat",
    "ingest",
    "report_upload",
    "complete",
    "failed",
] as const;

export type WorkflowStageId = (typeof WORKFLOW_STAGE_ORDER)[number];

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStageId, string> = {
    queued: "Queued",
    claimed: "Worker claimed",
    s3_download: "S3 download",
    scanner_start: "Scanner start",
    extract: "Extract",
    inventory: "Inventory",
    osv: "OSV",
    nvd: "NVD",
    redhat: "Red Hat",
    ingest: "Ingest",
    report_upload: "Report upload",
    complete: "Complete",
    failed: "Failed",
};

export function isTerminalStage(stage: string): boolean {
    const s = String(stage || "").toLowerCase().trim();
    return s === "scan.done" || s === "scan.summary" || s === "scan.err" || s === "scan.error" || s === "worker.stale.fail";
}

export function isErrorStage(stage: string): boolean {
    const s = String(stage || "").toLowerCase().trim();
    return s === "scan.err" || s === "scan.error" || s.endsWith(".err") || s.endsWith(".error") || s === "worker.stale.fail";
}

export function mapEventToWorkflowStage(stage: string): WorkflowStageId | null {
    const s = String(stage || "").toLowerCase().trim();
    if (!s) return null;

    if (s === "queued" || s === "job.queued" || s === "scan.queued") return "queued";
    if (s.startsWith("worker.claim") || s === "worker.start" || s === "worker.heartbeat") return "claimed";
    if (s.startsWith("s3.download")) return "s3_download";
    if (s === "scanner.start" || s.startsWith("scanner.start")) return "scanner_start";

    if (
        s.startsWith("container.extract") ||
        s.startsWith("container.layers") ||
        s.startsWith("iso.extract") ||
        s.startsWith("iso.squashfs") ||
        s.startsWith("iso.runtime")
    ) {
        return "extract";
    }

    if (
        s.startsWith("container.packages") ||
        s.startsWith("iso.inventory") ||
        s.startsWith("iso.repodata") ||
        s.startsWith("inventory.") ||
        s.startsWith("binary.") ||
        s.includes("rpmdb")
    ) {
        return "inventory";
    }

    if (s.startsWith("osv.")) return "osv";
    if (s.startsWith("nvd.")) return "nvd";
    if (s.startsWith("redhat.") || s.startsWith("rh.")) return "redhat";

    if (s.startsWith("worker.ingest") || s.startsWith("ingest.")) return "ingest";
    if (s.startsWith("worker.report") || s.startsWith("report.upload") || s.startsWith("s3.report")) return "report_upload";

    if (s === "scan.done" || s === "scan.summary") return "complete";
    if (isErrorStage(s)) return "failed";

    return null;
}

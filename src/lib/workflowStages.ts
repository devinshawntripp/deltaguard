export const WORKFLOW_STAGE_ORDER = [
    "queued",
    "claimed",
    "s3_download",
    "scanner_start",
    "extract",
    "inventory",
    "osv",
    "debian_tracker",
    "nvd",
    "redhat",
    "epss",
    "kev",
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
    debian_tracker: "Debian Tracker",
    nvd: "NVD",
    redhat: "Red Hat",
    epss: "EPSS",
    kev: "CISA KEV",
    ingest: "Ingest",
    report_upload: "Report upload",
    complete: "Complete",
    failed: "Failed",
};

export const PIPELINE_TO_WORKFLOW: Record<string, WorkflowStageId> = {
    extract: "extract",
    detect: "extract",
    inventory: "inventory",
    parse: "inventory",
    osv_query: "osv",
    osv_enrich: "osv",
    go_osv: "osv",
    nvd_enrich: "nvd",
    nvd_lookup: "nvd",
    redhat: "redhat",
    distro_feeds: "debian_tracker",
    epss: "epss",
    kev: "kev",
    report: "report_upload",
};

export function isTerminalStage(stage: string): boolean {
    const s = String(stage || "").toLowerCase().trim();
    return s === "scan.done" || s === "scan.summary" || s === "scan.err" || s === "scan.error" || s === "worker.stale.fail" || s === "pipeline.complete";
}

export function isErrorStage(stage: string): boolean {
    const s = String(stage || "").toLowerCase().trim();
    return s === "scan.err" || s === "scan.error" || s.endsWith(".err") || s.endsWith(".error") || s === "worker.stale.fail";
}

export function mapEventToWorkflowStage(stage: string, detail?: string): WorkflowStageId | null {
    const s = String(stage || "").toLowerCase().trim();
    if (!s) return null;

    // Pipeline meta-events — use detail for stage ID
    if (s === "pipeline.stage.start" || s === "pipeline.stage.progress") {
        const d = String(detail || "").toLowerCase().trim();
        return PIPELINE_TO_WORKFLOW[d] ?? null;
    }
    if (s === "pipeline.complete") return "complete";
    if (s === "scan.pipeline") return "scanner_start";

    // Terminal events
    if (s === "scan.done" || s === "scan.summary") return "complete";
    if (isErrorStage(s)) return "failed";

    // Worker lifecycle
    if (s === "queued" || s === "job.queued" || s === "scan.queued") return "queued";
    if (s.startsWith("worker.claim") || s === "worker.start") return "claimed";
    if (s === "worker.heartbeat") return null;
    if (s.startsWith("worker.ingest") || s.startsWith("ingest.")) return "ingest";
    if (s.startsWith("worker.report") || s.startsWith("report.upload") || s.startsWith("s3.report")) return "report_upload";

    // S3 download
    if (s.startsWith("s3.download")) return "s3_download";

    // Scanner init
    if (s === "scan.start" || s.startsWith("scan.image.") || s === "scanner.init" || s.startsWith("scanner.start")) return "scanner_start";
    if (s.startsWith("image.") || s.startsWith("cli.") || s.startsWith("sbom.import") || s.startsWith("sbom.scan")) return "scanner_start";

    // Extraction
    if (
        s.startsWith("container.extract") || s.startsWith("container.layers") ||
        s.startsWith("iso.extract") || s.startsWith("iso.squashfs") || s.startsWith("iso.runtime") ||
        s.startsWith("iso.detect") || s.startsWith("iso.entries") ||
        s.startsWith("archive.extract") || s === "archive.type" ||
        s.startsWith("dmg.extract")
    ) return "extract";

    // NVD (check specific sub-patterns before generic prefix)
    if (s.startsWith("binary.nvd.")) return "nvd";

    // Inventory (package detection)
    if (
        s.startsWith("container.packages") || s.startsWith("container.go.") ||
        s.startsWith("container.rpm.") || s.startsWith("container.filename.") ||
        s.startsWith("container.sbom.") ||
        s.startsWith("iso.inventory") || s.startsWith("iso.repodata") || s.startsWith("iso.packages") ||
        s.startsWith("inventory.") || s.startsWith("binary.") ||
        s.startsWith("archive.packages") || s.startsWith("archive.android") ||
        s.startsWith("files.") ||
        s.includes("rpmdb")
    ) return "inventory";

    // OSV
    if (
        s.startsWith("container.osv.") || s.startsWith("container.enrich.osv") ||
        s.startsWith("iso.osv.") || s.startsWith("archive.osv.") ||
        s.startsWith("osv.")
    ) return "osv";

    // Debian / Distro tracker
    if (
        s.startsWith("container.enrich.debian_tracker") || s.startsWith("container.enrich.debian.") ||
        s.startsWith("debian_tracker.") || s.startsWith("debian.tracker") || s.startsWith("debian.") ||
        s.startsWith("distro.")
    ) return "debian_tracker";

    // NVD enrichment
    if (
        s.startsWith("container.enrich.nvd") || s.startsWith("iso.enrich.nvd") ||
        s.startsWith("sbom.enrich.nvd") ||
        s.startsWith("nvd.")
    ) return "nvd";

    // Red Hat / OVAL
    if (
        s.startsWith("container.enrich.redhat") || s.startsWith("iso.enrich.redhat") ||
        s.startsWith("redhat.") || s.startsWith("rh.") ||
        s.startsWith("rhel_cves.") || s.startsWith("oval.")
    ) return "redhat";

    // EPSS
    if (s.startsWith("epss.")) return "epss";

    // KEV
    if (s.startsWith("kev.") || s.startsWith("cisa.kev")) return "kev";

    // Seed/vulndb events are not scan workflow stages
    if (s.startsWith("seed.") || s.startsWith("db.seed.") || s.startsWith("vulndb.")) return null;

    return null;
}

export function buildDynamicStageOrder(
    pipeline: Array<{ id: string; label: string; weight: number }>,
): WorkflowStageId[] {
    const prefix: WorkflowStageId[] = ["claimed", "s3_download", "scanner_start"];
    const suffix: WorkflowStageId[] = ["ingest", "report_upload", "complete"];

    const scannerStages: WorkflowStageId[] = pipeline
        .map((s) => PIPELINE_TO_WORKFLOW[s.id])
        .filter((id): id is WorkflowStageId => !!id);

    // Deduplicate (osv_query + osv_enrich both map to "osv")
    const seen = new Set<string>();
    const deduped = scannerStages.filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });

    return [...prefix, ...deduped, ...suffix];
}

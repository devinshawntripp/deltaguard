import { prisma } from "@/lib/prisma";
import { sendScanNotification, type ScanSummary } from "@/lib/notifications";
import { audit } from "@/lib/audit";

type Handler = (payload: any) => void;

// Track jobs we've already sent notifications for (in-memory, per-process)
const notifiedJobs = new Set<string>();

async function maybeNotifyOnCompletion(jobId: string) {
    if (notifiedJobs.has(jobId)) return;
    try {
        const rows = await prisma.$queryRaw<any[]>`
            SELECT id, status, org_id, registry_image, summary_json, created_by_user_id, error_msg
            FROM scan_jobs WHERE id = ${jobId}::uuid
        `;
        const job = rows[0];
        if (!job || !job.org_id) return;
        if (job.status !== "done" && job.status !== "failed") return;

        // Cross-pod dedup FIRST — only one pod should handle completion events.
        // This prevents duplicate audit logs AND duplicate notifications.
        const alreadySent = await prisma.$queryRaw<any[]>`
            SELECT 1 FROM scan_events
            WHERE job_id = ${jobId}::uuid AND stage = 'notification.sent'
            LIMIT 1
        `;
        if (alreadySent.length > 0) {
            notifiedJobs.add(jobId);
            return;
        }

        // Mark as sent BEFORE doing anything — wins the race against other pods
        await prisma.$executeRaw`
            INSERT INTO scan_events (job_id, ts, stage, detail)
            VALUES (${jobId}::uuid, NOW(), 'notification.sent', 'pending')
        `;
        notifiedJobs.add(jobId);

        // Build actor from the job's creator (so audit shows who, not just "System")
        const creatorActor = job.created_by_user_id ? {
            kind: "user" as const,
            orgId: job.org_id,
            rolesMask: 0n,
            userId: job.created_by_user_id,
        } : null;

        if (job.status === "failed") {
            audit({
                actor: creatorActor,
                action: "scan.failed" as any,
                targetType: "scan_job",
                targetId: job.id,
                detail: `Scan failed for ${job.registry_image || "uploaded file"}${job.error_msg ? ": " + job.error_msg : ""}`,
            });
            return;
        }

        // Audit log: scan completed
        const sj = job.summary_json ? (typeof job.summary_json === "string" ? JSON.parse(job.summary_json) : job.summary_json) : {};
        audit({
            actor: creatorActor,
            action: "scan.completed" as any,
            targetType: "scan_job",
            targetId: job.id,
            detail: `Scan completed for ${job.registry_image || "uploaded file"}: ${sj?.total_findings || 0} findings (C:${sj?.critical || 0} H:${sj?.high || 0} M:${sj?.medium || 0} L:${sj?.low || 0})`,
        });

        // Send notifications (only for completed scans, not failed)
        const summary: ScanSummary = {
            jobId: job.id,
            imageRef: job.registry_image || undefined,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0,
        };

        if (job.summary_json) {
            const sj = typeof job.summary_json === "string" ? JSON.parse(job.summary_json) : job.summary_json;
            // summary_json can have severity counts at top level OR nested under severity_counts
            const sc = sj?.severity_counts || sj?.severityCounts || sj || {};
            summary.critical = sc.critical || sc.Critical || 0;
            summary.high = sc.high || sc.High || 0;
            summary.medium = sc.medium || sc.Medium || 0;
            summary.low = sc.low || sc.Low || 0;
            summary.total = sj?.total_findings || sj?.totalFindings || (summary.critical + summary.high + summary.medium + summary.low);
        }

        sendScanNotification(job.org_id, summary).catch((e) => {
            console.error(`[jobsBus] notification send error for job ${jobId}:`, e);
        });
    } catch (e) {
        console.error(`[jobsBus] maybeNotifyOnCompletion error for job ${jobId}:`, e);
    }
}

function parseJobEventPayload(raw: string): { type: "changed"; id?: string; deleted?: boolean } | null {
    const payload = String(raw || "").trim();
    if (!payload) return null;
    if (payload.startsWith("{")) {
        try {
            const j = JSON.parse(payload);
            if (j && typeof j === "object") {
                const id = typeof (j as any).id === "string" ? (j as any).id : undefined;
                const deleted = (j as any).deleted === true;
                if (id) return { type: "changed", id, deleted };
            }
        } catch {
            return null;
        }
    }
    return { type: "changed", id: payload };
}

class JobsBus {
    private started = false;
    private handlers = new Set<Handler>();
    private client: any = null;
    private reconnectAttempts = 0;
    private reconnectTimer: NodeJS.Timeout | null = null;

    async start() {
        if (this.started) return;
        this.started = true;
        await this.connectPg();
    }

    private async connectPg() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        try {
            const pg = await import("pg");
            const newClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
            await newClient.connect();
            await newClient.query("LISTEN job_events");

            newClient.on("notification", (msg: any) => {
                try {
                    if (msg.channel === "job_events" && msg.payload) {
                        const parsed = parseJobEventPayload(msg.payload);
                        if (parsed) {
                            this.emit(parsed);
                            // Fire notifications on job completion
                            if (parsed.id && !parsed.deleted) {
                                maybeNotifyOnCompletion(parsed.id).catch(() => {});
                            }
                        }
                    }
                } catch { }
            });

            newClient.on("error", (err: any) => {
                console.error("[jobsBus] pg client error:", err?.message);
                this.handleDisconnect();
            });

            newClient.on("end", () => {
                console.warn("[jobsBus] pg connection ended, scheduling reconnect");
                this.handleDisconnect();
            });

            if (this.client) {
                this.client.removeAllListeners();
                try { this.client.end(); } catch { }
                try { (this.client as any).connection?.stream?.destroy(); } catch { }
            }
            this.client = newClient;
            this.reconnectAttempts = 0;
        } catch (err: any) {
            console.error("[jobsBus] pg connect failed:", err?.message);
            this.scheduleReconnect();
        }
    }

    private handleDisconnect() {
        const old = this.client;
        this.client = null;
        if (old) {
            old.removeAllListeners();
            try { old.end(); } catch { }
            try { (old as any).connection?.stream?.destroy(); } catch { }
        }
        this.scheduleReconnect();
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) return;
        const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectPg().catch(() => { });
        }, delay);
    }

    subscribe(fn: Handler): () => void {
        this.handlers.add(fn);
        return () => { this.handlers.delete(fn); };
    }

    emit(payload: any) {
        for (const h of this.handlers) {
            try { h(payload); } catch { }
        }
    }
}

const g = globalThis as any;
g.__jobsBus = g.__jobsBus || new JobsBus();
export const jobsBus: JobsBus = g.__jobsBus;

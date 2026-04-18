import { prisma } from "@/lib/prisma";
import { sendScanNotification, type ScanSummary } from "@/lib/notifications";

type Handler = (payload: any) => void;

// Track jobs we've already sent notifications for (in-memory, per-process)
const notifiedJobs = new Set<string>();

async function maybeNotifyOnCompletion(jobId: string) {
    if (notifiedJobs.has(jobId)) return;
    try {
        const rows = await prisma.$queryRaw<any[]>`
            SELECT id, status, org_id, registry_image, summary_json
            FROM scan_jobs WHERE id = ${jobId}::uuid
        `;
        const job = rows[0];
        if (!job || job.status !== "done" || !job.org_id) return;

        notifiedJobs.add(jobId);
        // Cap memory: prune old entries if set grows too large
        if (notifiedJobs.size > 10000) {
            const iter = notifiedJobs.values();
            for (let i = 0; i < 5000; i++) iter.next();
            // Clear oldest half (Set iteration is insertion order)
            const keep = new Set<string>();
            for (const v of notifiedJobs) {
                if (keep.size >= 5000) break;
                keep.add(v);
            }
            notifiedJobs.clear();
            for (const v of keep) notifiedJobs.add(v);
        }

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
            const sevCounts = sj?.severity_counts || sj?.severityCounts || {};
            summary.critical = sevCounts.critical || sevCounts.Critical || 0;
            summary.high = sevCounts.high || sevCounts.High || 0;
            summary.medium = sevCounts.medium || sevCounts.Medium || 0;
            summary.low = sevCounts.low || sevCounts.Low || 0;
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

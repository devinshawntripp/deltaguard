import { prisma } from "@/lib/prisma";

type EventRow = { id: number | bigint; ts: string; stage: string; detail?: string | null; pct?: number | null };
type Handler = (row: EventRow) => void;

type Listener = {
    handler: Handler;
    sinceId: number;
};

type Tailer = {
    jobId: string;
    listeners: Set<Listener>;
    lastId: number;
    terminal: boolean;
};

const TERMINAL_STAGES = new Set(["scan.done", "scan.summary", "scan.error", "scan.err", "pipeline.complete", "dispatcher.k8s.failed"]);

function isTerminalStage(stage: string): boolean {
    const s = stage.toLowerCase().trim();
    return TERMINAL_STAGES.has(s) || s === "worker.stale.fail";
}

class JobEventsBus {
    private tailers = new Map<string, Tailer>();
    private pgClient: any = null;
    private pgConnecting = false;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;

    private async fetchBacklog(jobId: string, sinceId: number, limit = 500): Promise<EventRow[]> {
        if (sinceId > 0) {
            return await prisma.$queryRaw<EventRow[]>`
SELECT id, ts::text, stage, detail, pct
FROM scan_events
WHERE job_id=${jobId}::uuid AND id > ${sinceId}::bigint
ORDER BY id ASC
LIMIT ${limit}
            `;
        }
        return await prisma.$queryRaw<EventRow[]>`
SELECT id, ts::text, stage, detail, pct
FROM scan_events
WHERE job_id=${jobId}::uuid
ORDER BY id ASC
LIMIT ${limit}
        `;
    }

    private stopTailer(t: Tailer) {
        t.terminal = true;
        this.tailers.delete(t.jobId);
    }

    private async dispatchForJob(jobId: string) {
        const t = this.tailers.get(jobId);
        if (!t || t.terminal || t.listeners.size === 0) return;
        try {
            const rows = await this.fetchBacklog(jobId, t.lastId, 200);
            let sawTerminal = false;
            let sawSbomComplete = false;
            for (const r of rows) {
                const rowId = typeof r.id === "bigint" ? Number(r.id) : Number(r.id);
                const normalized: EventRow = { ...r, id: rowId };
                if (rowId > t.lastId) t.lastId = rowId;
                for (const l of t.listeners) {
                    if (rowId <= l.sinceId) continue;
                    l.sinceId = rowId;
                    try { l.handler(normalized); } catch { }
                }
                if (isTerminalStage(r.stage)) sawTerminal = true;
                if (r.stage === "sbom_export_complete") sawSbomComplete = true;
            }
            // Only stop after both scan terminal AND sbom complete have been delivered
            if (sawTerminal && sawSbomComplete) {
                this.stopTailer(t);
            }
        } catch { }
    }

    private async ensurePgListener() {
        if (this.pgClient || this.pgConnecting) return;
        this.pgConnecting = true;
        try {
            const pg = await import("pg");
            const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            await client.query("LISTEN scan_events");

            client.on("notification", (msg: any) => {
                if (msg.channel === "scan_events" && msg.payload) {
                    this.dispatchForJob(msg.payload).catch(() => {});
                }
            });

            client.on("error", (err: any) => {
                console.error("[jobEventsBus] pg client error:", err?.message);
                this.handleDisconnect();
            });

            client.on("end", () => {
                console.warn("[jobEventsBus] pg connection ended, scheduling reconnect");
                this.handleDisconnect();
            });

            if (this.pgClient) {
                this.pgClient.removeAllListeners();
                try { this.pgClient.end(); } catch { }
                try { (this.pgClient as any).connection?.stream?.destroy(); } catch { }
            }
            this.pgClient = client;
            this.reconnectAttempts = 0;
        } catch (err: any) {
            console.error("[jobEventsBus] pg connect failed:", err?.message);
            this.scheduleReconnect();
        } finally {
            this.pgConnecting = false;
        }
    }

    private handleDisconnect() {
        const old = this.pgClient;
        this.pgClient = null;
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
            this.ensurePgListener().catch(() => {});
        }, delay);
    }

    async subscribe(jobId: string, handler: Handler, opts?: { sinceId?: number }): Promise<() => void> {
        let t = this.tailers.get(jobId);
        if (!t) {
            t = { jobId, listeners: new Set<Listener>(), lastId: 0, terminal: false };
            this.tailers.set(jobId, t);
        }
        const listener: Listener = { handler, sinceId: Math.max(0, Number(opts?.sinceId || 0)) };
        t.listeners.add(listener);
        // Send initial backlog to this handler only
        try {
            const rows = await this.fetchBacklog(jobId, listener.sinceId, 500);
            for (const r of rows) {
                const rowId = typeof r.id === "bigint" ? Number(r.id) : Number(r.id);
                const normalized: EventRow = { ...r, id: rowId };
                if (rowId > listener.sinceId) listener.sinceId = rowId;
                if (rowId > t.lastId) t.lastId = rowId;
                handler(normalized);
            }
            // Only stop if BOTH terminal and sbom_export_complete are in the backlog
            const hasTerminal = rows.some(r => isTerminalStage(r.stage));
            const hasSbomComplete = rows.some(r => r.stage === "sbom_export_complete");
            if (hasTerminal && hasSbomComplete) {
                t.terminal = true;
                t.listeners.delete(listener);
                return () => { };
            }
        } catch { }
        await this.ensurePgListener();
        return () => {
            const cur = this.tailers.get(jobId);
            if (!cur) return;
            cur.listeners.delete(listener);
            if (cur.listeners.size === 0 && !cur.terminal) {
                this.tailers.delete(jobId);
            }
        };
    }
}

const g = globalThis as any;
g.__jobEventsBus = g.__jobEventsBus || new JobEventsBus();
export const jobEventsBus: JobEventsBus = g.__jobEventsBus;

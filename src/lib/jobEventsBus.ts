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
    timer: NodeJS.Timeout | null;
    starting: boolean;
    terminal: boolean;
};

const TERMINAL_STAGES = new Set(["scan.done", "scan.summary", "scan.error", "scan.err"]);

function isTerminalStage(stage: string): boolean {
    const s = stage.toLowerCase().trim();
    return TERMINAL_STAGES.has(s) || s === "worker.stale.fail";
}

class JobEventsBus {
    private tailers = new Map<string, Tailer>();

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
        if (t.timer) {
            clearInterval(t.timer);
            t.timer = null;
        }
        t.terminal = true;
        this.tailers.delete(t.jobId);
    }

    private pump(t: Tailer) {
        if (t.starting || t.listeners.size === 0 || t.terminal) return;
        t.starting = true;
        const run = async () => {
            try {
                const rows = await this.fetchBacklog(t.jobId, t.lastId, 200);
                for (const r of rows) {
                    const rowId = typeof r.id === "bigint" ? Number(r.id) : Number(r.id);
                    const normalized: EventRow = { ...r, id: rowId };
                    if (rowId > t.lastId) t.lastId = rowId;
                    for (const l of t.listeners) {
                        if (rowId <= l.sinceId) continue;
                        l.sinceId = rowId;
                        try { l.handler(normalized); } catch { }
                    }
                    // Stop polling when job reaches a terminal stage
                    if (isTerminalStage(r.stage)) {
                        this.stopTailer(t);
                        return;
                    }
                }
            } catch { }
            finally { t.starting = false; }
        };
        run().catch(() => { t.starting = false; });
    }

    private ensureTimer(t: Tailer) {
        if (t.timer || t.terminal) return;
        t.timer = setInterval(() => this.pump(t), 1000);
    }

    async subscribe(jobId: string, handler: Handler, opts?: { sinceId?: number }): Promise<() => void> {
        let t = this.tailers.get(jobId);
        if (!t) {
            t = { jobId, listeners: new Set<Listener>(), lastId: 0, timer: null, starting: false, terminal: false };
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
            // If already terminal in backlog, stop immediately
            if (rows.some(r => isTerminalStage(r.stage))) {
                t.terminal = true;
                t.listeners.delete(listener);
                return () => { };
            }
        } catch { }
        this.ensureTimer(t);
        this.pump(t);
        return () => {
            const cur = this.tailers.get(jobId);
            if (!cur) return;
            cur.listeners.delete(listener);
            if (cur.listeners.size === 0 && !cur.terminal) {
                if (cur.timer) clearInterval(cur.timer);
                this.tailers.delete(jobId);
            }
        };
    }
}

const g = globalThis as any;
g.__jobEventsBus = g.__jobEventsBus || new JobEventsBus();
export const jobEventsBus: JobEventsBus = g.__jobEventsBus;

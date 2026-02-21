import { prisma } from "@/lib/prisma";

type EventRow = { ts: string; stage: string; detail?: string | null; pct?: number | null };
type Handler = (row: EventRow) => void;

type Tailer = {
    jobId: string;
    listeners: Set<Handler>;
    lastTs: string | null;
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

    private async fetchBacklog(jobId: string, since: string | null, limit = 500): Promise<EventRow[]> {
        if (since) {
            return await prisma.$queryRaw<EventRow[]>`SELECT ts, stage, detail, pct FROM scan_events WHERE job_id=${jobId}::uuid AND ts > ${since}::timestamptz ORDER BY ts ASC LIMIT ${limit}`;
        }
        return await prisma.$queryRaw<EventRow[]>`SELECT ts, stage, detail, pct FROM scan_events WHERE job_id=${jobId}::uuid ORDER BY ts ASC LIMIT ${limit}`;
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
                const rows = await this.fetchBacklog(t.jobId, t.lastTs, 200);
                for (const r of rows) {
                    t.lastTs = r.ts;
                    for (const h of t.listeners) {
                        try { h(r); } catch { }
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

    async subscribe(jobId: string, handler: Handler): Promise<() => void> {
        let t = this.tailers.get(jobId);
        if (!t) {
            t = { jobId, listeners: new Set<Handler>(), lastTs: null, timer: null, starting: false, terminal: false };
            this.tailers.set(jobId, t);
        }
        t.listeners.add(handler);
        // Send initial backlog to this handler only
        try {
            const rows = await this.fetchBacklog(jobId, null, 500);
            for (const r of rows) handler(r);
            if (rows.length) t.lastTs = rows[rows.length - 1].ts;
            // If already terminal in backlog, stop immediately
            if (rows.some(r => isTerminalStage(r.stage))) {
                t.terminal = true;
                t.listeners.delete(handler);
                return () => { };
            }
        } catch { }
        this.ensureTimer(t);
        this.pump(t);
        return () => {
            const cur = this.tailers.get(jobId);
            if (!cur) return;
            cur.listeners.delete(handler);
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

import { prisma } from "@/lib/prisma";

type EventRow = { ts: string; stage: string; detail?: string | null; pct?: number | null };
type Handler = (row: EventRow) => void;

type Tailer = {
    jobId: string;
    listeners: Set<Handler>;
    lastTs: string | null;
    timer: NodeJS.Timeout | null;
    starting: boolean;
};

class JobEventsBus {
    private tailers = new Map<string, Tailer>();

    private async fetchBacklog(jobId: string, since: string | null, limit = 500): Promise<EventRow[]> {
        if (since) {
            // Fetch new rows since timestamp
            return await prisma.$queryRaw<EventRow[]>`SELECT ts, stage, detail, pct FROM scan_events WHERE job_id=${jobId}::uuid AND ts > ${since}::timestamptz ORDER BY ts ASC LIMIT ${limit}`;
        }
        // Initial backlog
        return await prisma.$queryRaw<EventRow[]>`SELECT ts, stage, detail, pct FROM scan_events WHERE job_id=${jobId}::uuid ORDER BY ts ASC LIMIT ${limit}`;
    }

    private pump(t: Tailer) {
        if (t.starting || t.listeners.size === 0) return;
        t.starting = true;
        const run = async () => {
            try {
                const rows = await this.fetchBacklog(t.jobId, t.lastTs, 200);
                for (const r of rows) {
                    t.lastTs = r.ts;
                    for (const h of t.listeners) {
                        try { h(r); } catch { }
                    }
                }
            } catch { }
            finally { t.starting = false; }
        };
        run().catch(() => { t.starting = false; });
    }

    private ensureTimer(t: Tailer) {
        if (t.timer) return;
        t.timer = setInterval(() => this.pump(t), 1000);
    }

    async subscribe(jobId: string, handler: Handler): Promise<() => void> {
        let t = this.tailers.get(jobId);
        if (!t) {
            t = { jobId, listeners: new Set<Handler>(), lastTs: null, timer: null, starting: false };
            this.tailers.set(jobId, t);
        }
        t.listeners.add(handler);
        // Send initial backlog to this handler only
        try {
            const rows = await this.fetchBacklog(jobId, null, 500);
            for (const r of rows) handler(r);
            if (rows.length) t.lastTs = rows[rows.length - 1].ts;
        } catch { }
        this.ensureTimer(t);
        this.pump(t);
        return () => {
            const cur = this.tailers.get(jobId);
            if (!cur) return;
            cur.listeners.delete(handler);
            if (cur.listeners.size === 0) {
                if (cur.timer) clearInterval(cur.timer);
                this.tailers.delete(jobId);
            }
        };
    }
}

const g = globalThis as any;
g.__jobEventsBus = g.__jobEventsBus || new JobEventsBus();
export const jobEventsBus: JobEventsBus = g.__jobEventsBus;



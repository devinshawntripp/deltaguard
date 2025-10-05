import { listJobs } from "@/lib/jobs";

type Handler = (payload: any) => void;

class JobsBus {
    private started = false;
    private handlers = new Set<Handler>();
    private client: any = null;
    private poll: NodeJS.Timeout | null = null;

    async start() {
        if (this.started) return;
        this.started = true;
        try {
            const pg = await import("pg");
            this.client = new pg.Client({ connectionString: process.env.DATABASE_URL });
            await this.client.connect();
            await this.client.query("LISTEN job_events");
            this.client.on("notification", (msg: any) => {
                try {
                    if (msg.channel === "job_events" && msg.payload) {
                        const data = JSON.parse(msg.payload);
                        this.emit({ type: "changed", item: data });
                    }
                } catch { }
            });
        } catch {
            // Fallback: server-side polling broadcast
            this.poll = setInterval(async () => {
                try {
                    const items = await listJobs(50);
                    this.emit({ type: "changed_bulk", items });
                } catch { }
            }, 2000);
        }
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



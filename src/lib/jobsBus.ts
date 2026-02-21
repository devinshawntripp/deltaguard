import { listJobs } from "@/lib/jobs";

type Handler = (payload: any) => void;

class JobsBus {
    private started = false;
    private handlers = new Set<Handler>();
    private client: any = null;
    private poll: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private reconnectTimer: NodeJS.Timeout | null = null;

    async start() {
        if (this.started) return;
        this.started = true;
        await this.connectPg();
    }

    private async connectPg() {
        // Clear any pending reconnect timer
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
                        // Payload is just the job id (a UUID string)
                        this.emit({ type: "changed", id: msg.payload });
                    }
                } catch { }
            });

            newClient.on("error", (err: any) => {
                console.error("[jobsBus] pg client error:", err?.message);
                this.scheduleReconnect();
            });

            newClient.on("end", () => {
                console.warn("[jobsBus] pg connection ended, scheduling reconnect");
                this.scheduleReconnect();
            });

            // Replace old client
            if (this.client) {
                try { this.client.end(); } catch { }
            }
            this.client = newClient;
            this.reconnectAttempts = 0;

            // Clear fallback polling if pg is now available
            if (this.poll) {
                clearInterval(this.poll);
                this.poll = null;
            }
        } catch (err: any) {
            console.error("[jobsBus] pg connect failed:", err?.message);
            this.scheduleReconnect();
            // Start fallback polling only if not already running
            if (!this.poll) {
                this.poll = setInterval(async () => {
                    try {
                        const items = await listJobs(50);
                        this.emit({ type: "changed_bulk", items });
                    } catch { }
                }, 2000);
            }
        }
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

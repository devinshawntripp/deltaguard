type Handler = (payload: any) => void;

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
                        if (parsed) this.emit(parsed);
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
                try { this.client.end(); } catch { }
            }
            this.client = newClient;
            this.reconnectAttempts = 0;
        } catch (err: any) {
            console.error("[jobsBus] pg connect failed:", err?.message);
            this.scheduleReconnect();
        }
    }

    private handleDisconnect() {
        this.client = null;
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

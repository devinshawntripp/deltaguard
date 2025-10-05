// Simple client-side EventSource connection pool with de-duplication by URL
// Default max concurrent connections is 5; configurable via NEXT_PUBLIC_MAX_SSE

type OpenOptions = {
    onOpen?: () => void;
    onMessage: (ev: MessageEvent) => void;
    onError?: (ev: Event) => void;
};

const MAX = Number(process.env.NEXT_PUBLIC_MAX_SSE || 5);

type Listener = { onMessage: (ev: MessageEvent) => void; onError?: (ev: Event) => void };
type Entry = { url: string; es: EventSource | null; listeners: Set<Listener>; state: "queued" | "open"; resolves: ((closer: () => void) => void)[] };

const entries = new Map<string, Entry>();
let openCount = 0;
const fifo: string[] = [];

function dispatchMessage(e: Entry, ev: MessageEvent) { for (const l of e.listeners) { try { l.onMessage(ev); } catch { } } }
function dispatchError(e: Entry, ev: Event) { for (const l of e.listeners) { try { l.onError?.(ev); } catch { } } }

function closeEntry(url: string) {
    const e = entries.get(url); if (!e) return;
    try { e.es?.close(); } catch { }
    if (e.state === "open") openCount = Math.max(0, openCount - 1);
    entries.delete(url);
    pump();
}

function pump() {
    while (openCount < MAX && fifo.length) {
        const url = fifo.shift() as string;
        const e = entries.get(url); if (!e || e.state !== "queued") continue;
        let es: EventSource | null = null;
        try { es = new EventSource(url); } catch (err) {
            dispatchError(e, new Event("error"));
            for (const r of e.resolves) r(() => { });
            entries.delete(url);
            continue;
        }
        e.es = es; e.state = "open"; openCount++;
        es.onmessage = (ev) => dispatchMessage(e, ev);
        es.onerror = (ev) => { dispatchError(e, ev); closeEntry(url); };
        const closer = () => { if (e.listeners.size === 0) closeEntry(url); };
        for (const r of e.resolves) r(closer);
        e.resolves = [];
    }
}

export function openSse(url: string, opts: OpenOptions): Promise<() => void> {
    let e = entries.get(url);
    if (!e) { e = { url, es: null, listeners: new Set(), state: "queued", resolves: [] }; entries.set(url, e); fifo.push(url); pump(); }
    const listener: Listener = { onMessage: opts.onMessage, onError: opts.onError };
    e.listeners.add(listener);
    return new Promise((resolve) => {
        e!.resolves.push((closer) => {
            try { opts.onOpen?.(); } catch { }
            const unsubscribe = () => {
                const cur = entries.get(url);
                if (!cur) return;
                cur.listeners.delete(listener);
                if (cur.listeners.size === 0) closeEntry(url);
            };
            resolve(unsubscribe);
        });
        pump();
    });
}

export function getSsePoolState() { return { max: MAX, open: openCount, queued: fifo.length, urls: Array.from(entries.keys()) }; }



import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { presignGet } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory cache for findings.
// Key: "<job_id>:<report_key>" → { items, cachedAt, permanent }
type CacheEntry = { items: any[]; cachedAt: number; permanent: boolean };
const findingsCache = new Map<string, CacheEntry>();
const RUNNING_TTL_MS = 30_000; // 30 seconds for in-progress jobs
const MAX_CACHE_ENTRIES = 500;

function pruneCacheIfNeeded() {
    if (findingsCache.size <= MAX_CACHE_ENTRIES) return;
    // Evict oldest non-permanent entries first
    const entries = [...findingsCache.entries()]
        .filter(([, v]) => !v.permanent)
        .sort((a, b) => a[1].cachedAt - b[1].cachedAt);
    for (const [k] of entries.slice(0, findingsCache.size - MAX_CACHE_ENTRIES)) {
        findingsCache.delete(k);
    }
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const job = await getJob(id);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (!job.report_bucket || !job.report_key) return NextResponse.json({ items: [] });

    const cacheKey = `${id}:${job.report_key}`;
    const now = Date.now();
    const cached = findingsCache.get(cacheKey);
    if (cached) {
        if (cached.permanent || now - cached.cachedAt < RUNNING_TTL_MS) {
            return NextResponse.json({ items: cached.items });
        }
    }

    try {
        const url = await presignGet({ bucket: String(job.report_bucket), key: String(job.report_key) });
        const res = await fetch(url.url);
        if (!res.ok) return NextResponse.json({ items: [] });
        const json = await res.json();
        const items = Array.isArray(json.findings) ? json.findings : [];

        const permanent = job.status === "done";
        findingsCache.set(cacheKey, { items, cachedAt: now, permanent });
        pruneCacheIfNeeded();

        return NextResponse.json({ items });
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

import { prisma, ensureJobsTable } from "@/lib/prisma";
import crypto from "node:crypto";

export type Job = {
    id: string;
    status: "queued" | "running" | "done" | "failed";
    bucket: string;
    object_key: string;
    mode: string;
    format: string;
    refs: boolean;
    created_at: string;
    started_at?: string | null;
    finished_at?: string | null;
    progress_pct: number;
    progress_msg?: string | null;
    report_bucket?: string | null;
    report_key?: string | null;
    error_msg?: string | null;
    summary_json?: any;
};

async function init() {
    await ensureJobsTable();
}

export async function createJob(params: { id?: string; bucket: string; object_key: string; mode?: string; format?: string; refs?: boolean }): Promise<Job> {
    await init();
    const id = params.id || crypto.randomUUID();
    const mode = params.mode || "light";
    const format = params.format || "json";
    const refs = params.refs ?? false;
    await prisma.$executeRaw`INSERT INTO scan_jobs (id, status, bucket, object_key, mode, format, refs) VALUES (${id}::uuid,'queued',${params.bucket},${params.object_key},${mode},${format},${refs})`;
    const rows = await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE id=${id}::uuid`;
    const job = rows[0] as Job;
    // Emit NOTIFY so SSE clients update immediately
    try { await prisma.$executeRaw`SELECT pg_notify('job_events', ${JSON.stringify(job)})`; } catch { }
    return job;
}

export async function getJob(id: string): Promise<Job | null> {
    await init();
    const rows = await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE id=${id}::uuid`;
    return rows[0] || null;
}

export async function listJobs(limit = 100): Promise<Job[]> {
    await init();
    const rows = await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs ORDER BY created_at DESC LIMIT ${limit}`;
    return rows as Job[];
}


import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import crypto from "node:crypto";
import type { ScannerSettings } from "@/lib/scannerSettings";

export type Job = {
    id: string;
    status: "queued" | "running" | "done" | "failed" | "deleting";
    bucket: string;
    object_key: string;
    mode: string;
    format: string;
    refs: boolean;
    org_id: string;
    created_by_user_id?: string | null;
    created_by_api_key_id?: string | null;
    settings_snapshot?: (ScannerSettings & { summary_only?: boolean }) | null;
    scan_status?: string | null;
    inventory_status?: string | null;
    inventory_reason?: string | null;
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
    await ensurePlatformSchema();
}

export async function createJob(params: {
    id?: string;
    bucket: string;
    object_key: string;
    mode?: string;
    format?: string;
    refs?: boolean;
    org_id: string;
    created_by_user_id?: string | null;
    created_by_api_key_id?: string | null;
    settings_snapshot?: (ScannerSettings & { summary_only?: boolean }) | null;
}): Promise<Job> {
    await init();
    const id = params.id || crypto.randomUUID();
    const mode = params.mode || "light";
    const format = params.format || "json";
    const refs = params.refs ?? false;
    const settingsSnapshot =
        params.settings_snapshot == null ? null : JSON.stringify(params.settings_snapshot);
    await prisma.$executeRaw`
INSERT INTO scan_jobs (
  id,
  status,
  bucket,
  object_key,
  mode,
  format,
  refs,
  org_id,
  created_by_user_id,
  created_by_api_key_id,
  settings_snapshot
)
VALUES (
  ${id}::uuid,
  'queued',
  ${params.bucket},
  ${params.object_key},
  ${mode},
  ${format},
  ${refs},
  ${params.org_id}::uuid,
  ${params.created_by_user_id || null}::uuid,
  ${params.created_by_api_key_id || null}::uuid,
  ${settingsSnapshot || null}::jsonb
)
    `;
    const rows = await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE id=${id}::uuid`;
    const job = rows[0] as Job;
    // Emit NOTIFY with just the job id (tiny payload, no 8000-byte limit risk)
    try { await prisma.$executeRaw`SELECT pg_notify('job_events', ${id})`; } catch { }
    return job;
}

export async function createRegistryJob(params: {
    registry_config_id: string;
    registry_image: string;
    org_id: string;
    created_by_user_id?: string | null;
    created_by_api_key_id?: string | null;
    settings_snapshot?: (ScannerSettings & { summary_only?: boolean }) | null;
}): Promise<Job> {
    await init();
    const id = crypto.randomUUID();
    const bucket = process.env.UPLOADS_BUCKET || process.env.MINIO_UPLOADS_BUCKET || "deltaguard";
    const objectKey = `registry-pulls/${id}/image.tar`;
    const settingsSnapshot =
        params.settings_snapshot == null ? null : JSON.stringify(params.settings_snapshot);
    await prisma.$executeRaw`
INSERT INTO scan_jobs (
  id, status, bucket, object_key, mode, format, refs,
  org_id, created_by_user_id, created_by_api_key_id, settings_snapshot,
  source_type, registry_image, registry_config_id
)
VALUES (
  ${id}::uuid, 'queued', ${bucket}, ${objectKey},
  'light', 'json', FALSE,
  ${params.org_id}::uuid,
  ${params.created_by_user_id || null}::uuid,
  ${params.created_by_api_key_id || null}::uuid,
  ${settingsSnapshot || null}::jsonb,
  'registry', ${params.registry_image}, ${params.registry_config_id}::uuid
)
    `;
    const rows = await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE id=${id}::uuid`;
    const job = rows[0] as Job;
    try { await prisma.$executeRaw`SELECT pg_notify('job_events', ${id})`; } catch { }
    return job;
}

export async function getJob(id: string, orgId?: string): Promise<Job | null> {
    await init();
    const rows = orgId
        ? await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE id=${id}::uuid AND org_id=${orgId}::uuid`
        : await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE id=${id}::uuid`;
    return rows[0] || null;
}

export async function listJobs(limit = 100, orgId?: string): Promise<Job[]> {
    await init();
    const rows = orgId
        ? await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE org_id=${orgId}::uuid ORDER BY created_at DESC LIMIT ${limit}`
        : await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs ORDER BY created_at DESC LIMIT ${limit}`;
    return rows as Job[];
}

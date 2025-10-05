import { PrismaClient } from "@/generated/prisma";

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// Ensure scan_jobs exists (raw SQL helper)
export async function ensureJobsTable() {
    try {
        await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS scan_jobs (
  id              UUID PRIMARY KEY,
  status          TEXT NOT NULL CHECK (status IN ('queued','running','done','failed')),
  bucket          TEXT NOT NULL,
  object_key      TEXT NOT NULL,
  mode            TEXT NOT NULL DEFAULT 'light',
  format          TEXT NOT NULL DEFAULT 'json',
  refs            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  progress_pct    INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  progress_msg    TEXT,
  report_bucket   TEXT,
  report_key      TEXT,
  error_msg       TEXT,
  summary_json    JSONB
)`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_scan_jobs_status_created ON scan_jobs (status, created_at)`);
        // Create or replace a trigger function that emits NOTIFY job_events with the full row JSON
        await prisma.$executeRawUnsafe(`
CREATE OR REPLACE FUNCTION notify_job_event() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('job_events', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
        `);
        // Create trigger if not exists using DO block
        await prisma.$executeRawUnsafe(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'scan_jobs_notify') THEN
    CREATE TRIGGER scan_jobs_notify
    AFTER INSERT OR UPDATE ON scan_jobs
    FOR EACH ROW EXECUTE FUNCTION notify_job_event();
  END IF;
END$$;
        `);
    } catch { }
}



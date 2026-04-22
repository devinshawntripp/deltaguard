import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@/lib/schema";
import { AUDIT_ACTIONS } from "@/lib/schema";
import type { RequestActor } from "@/lib/authz";

type AuditContext = {
  actor: RequestActor | null;
  action: AuditAction;
  targetType?: string;    // "scan_job", "registry", "policy", etc.
  targetId?: string;      // UUID of the target resource
  detail?: string;        // Human-readable description
  metadata?: Record<string, unknown>; // Arbitrary JSON (old value, new value, etc.)
  ip?: string;            // Client IP
};

/**
 * Write an audit log entry. Non-blocking — errors are logged but don't
 * affect the request. Call this AFTER the action succeeds.
 */
export function audit(ctx: AuditContext): void {
  const meta = AUDIT_ACTIONS[ctx.action];

  // Fire and forget — don't block the request
  writeAuditLog(ctx, meta).catch((err) => {
    console.error(`[audit] Failed to write ${ctx.action}:`, err);
  });
}

async function writeAuditLog(
  ctx: AuditContext,
  meta: { category: string; description: string; severity: string },
): Promise<void> {
  const detailText = ctx.detail ?? meta.description;
  const orgId = ctx.actor?.orgId ?? null;

  await prisma.$executeRaw`
    INSERT INTO audit_log (
      org_id, user_id, action, category, severity,
      target_type, target_id, detail, metadata, ip, search_vector
    ) VALUES (
      ${orgId}::uuid,
      ${ctx.actor?.userId ?? null}::uuid,
      ${ctx.action},
      ${meta.category},
      ${meta.severity},
      ${ctx.targetType ?? null},
      ${ctx.targetId ?? null},
      ${detailText},
      ${ctx.metadata ? JSON.stringify(ctx.metadata) : null}::jsonb,
      ${ctx.ip ?? null},
      to_tsvector('english',
        COALESCE(${ctx.action}, '') || ' ' ||
        COALESCE(${meta.category}, '') || ' ' ||
        COALESCE(${detailText}, '') || ' ' ||
        COALESCE(${ctx.targetType ?? null}, '') || ' ' ||
        COALESCE(${ctx.targetId ?? null}, '') || ' ' ||
        COALESCE(${ctx.ip ?? null}, '')
      )
    )
  `;

  // Notify SSE listeners about new audit event
  if (orgId) {
    await prisma.$executeRaw`SELECT pg_notify('audit_events', ${orgId + ':' + ctx.action})`;
  }
}

/** Extract client IP from request headers */
export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers?.get?.("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers?.get?.("x-real-ip");
  if (real) return real;
  return undefined;
}

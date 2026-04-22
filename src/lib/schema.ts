/**
 * Master Schema — single source of truth for:
 * - Audit log actions and categories
 * - Authorization roles and permissions
 * - Team scoping rules
 *
 * When adding a new feature, update this file FIRST, then implement.
 */

// ──────────────────────────────────────────────────────────
// Audit Log Actions
// ──────────────────────────────────────────────────────────

export const AUDIT_ACTIONS = {
  // Auth
  "auth.login": { category: "auth", description: "User logged in", severity: "info" },
  "auth.logout": { category: "auth", description: "User logged out", severity: "info" },
  "auth.login_failed": { category: "auth", description: "Failed login attempt", severity: "warn" },

  // Scans
  "scan.created": { category: "scans", description: "Scan job created", severity: "info" },
  "scan.completed": { category: "scans", description: "Scan completed with findings", severity: "info" },
  "scan.failed": { category: "scans", description: "Scan job failed", severity: "warn" },
  "scan.cancelled": { category: "scans", description: "Scan job cancelled", severity: "info" },
  "scan.deleted": { category: "scans", description: "Scan job deleted", severity: "warn" },

  // Registries
  "registry.created": { category: "registries", description: "Registry added", severity: "info" },
  "registry.updated": { category: "registries", description: "Registry updated", severity: "info" },
  "registry.deleted": { category: "registries", description: "Registry deleted", severity: "warn" },
  "registry.tested": { category: "registries", description: "Registry connection tested", severity: "info" },

  // Schedules
  "schedule.created": { category: "schedules", description: "Scan schedule created", severity: "info" },
  "schedule.updated": { category: "schedules", description: "Scan schedule updated", severity: "info" },
  "schedule.deleted": { category: "schedules", description: "Scan schedule deleted", severity: "warn" },

  // Notifications
  "notification.channel_created": { category: "notifications", description: "Notification channel added", severity: "info" },
  "notification.channel_updated": { category: "notifications", description: "Notification channel updated", severity: "info" },
  "notification.channel_deleted": { category: "notifications", description: "Notification channel deleted", severity: "warn" },
  "notification.test_sent": { category: "notifications", description: "Test notification sent", severity: "info" },

  // Policies
  "policy.created": { category: "policies", description: "Scan policy created", severity: "info" },
  "policy.updated": { category: "policies", description: "Scan policy updated", severity: "info" },
  "policy.deleted": { category: "policies", description: "Scan policy deleted", severity: "warn" },
  "policy.evaluated": { category: "policies", description: "Policy evaluated against scan", severity: "info" },

  // Org Management
  "org.member_invited": { category: "org", description: "Member invited to org", severity: "info" },
  "org.member_removed": { category: "org", description: "Member removed from org", severity: "warn" },
  "org.member_role_changed": { category: "org", description: "Member role changed", severity: "warn" },
  "org.settings_updated": { category: "org", description: "Org settings updated", severity: "info" },

  // API Keys
  "apikey.created": { category: "api_keys", description: "API key created", severity: "info" },
  "apikey.revoked": { category: "api_keys", description: "API key revoked", severity: "warn" },

  // Billing
  "billing.plan_upgraded": { category: "billing", description: "Plan upgraded", severity: "info" },
  "billing.plan_cancelled": { category: "billing", description: "Plan cancelled", severity: "warn" },

  // Scanner Settings
  "scanner.settings_updated": { category: "scanner", description: "Scanner settings changed", severity: "info" },

  // Reports
  "report.generated": { category: "reports", description: "Compliance report generated", severity: "info" },
} as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS;
export type AuditCategory = typeof AUDIT_ACTIONS[AuditAction]["category"];

// ──────────────────────────────────────────────────────────
// Authorization — Roles & Permissions
// ──────────────────────────────────────────────────────────

export const ROLES = {
  VIEWER:        { bit: BigInt(1),   label: "Viewer",        description: "Read scans, findings, reports" },
  ANALYST:       { bit: BigInt(2),   label: "Analyst",       description: "Detailed findings analysis" },
  OPERATOR:      { bit: BigInt(4),   label: "Operator",      description: "Create and manage scans" },
  SCAN_ADMIN:    { bit: BigInt(8),   label: "Scan Admin",    description: "Manage scanner settings, registries" },
  POLICY_ADMIN:  { bit: BigInt(16),  label: "Policy Admin",  description: "Manage policies and license rules" },
  BILLING_ADMIN: { bit: BigInt(32),  label: "Billing Admin", description: "Manage billing and view usage" },
  API_KEY_ADMIN: { bit: BigInt(64),  label: "API Key Admin", description: "Create and revoke API keys" },
  ORG_OWNER:     { bit: BigInt(128), label: "Org Owner",     description: "Full org management" },
} as const;

// Which roles can perform which actions
export const PERMISSIONS: Record<string, bigint[]> = {
  // Scans
  "scan.read":    [ROLES.VIEWER.bit, ROLES.ANALYST.bit, ROLES.OPERATOR.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "scan.create":  [ROLES.OPERATOR.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "scan.delete":  [ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],

  // Registries
  "registry.read":   [ROLES.VIEWER.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "registry.manage": [ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],

  // Schedules
  "schedule.read":   [ROLES.VIEWER.bit, ROLES.OPERATOR.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "schedule.manage": [ROLES.OPERATOR.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],

  // Policies
  "policy.read":   [ROLES.VIEWER.bit, ROLES.POLICY_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "policy.manage": [ROLES.POLICY_ADMIN.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],

  // Notifications
  "notification.read":   [ROLES.VIEWER.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "notification.manage": [ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],

  // Org
  "org.read":    [ROLES.VIEWER.bit, ROLES.ORG_OWNER.bit],
  "org.manage":  [ROLES.ORG_OWNER.bit],

  // API Keys
  "apikey.read":   [ROLES.API_KEY_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "apikey.manage": [ROLES.API_KEY_ADMIN.bit, ROLES.ORG_OWNER.bit],

  // Billing
  "billing.read":   [ROLES.BILLING_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "billing.manage": [ROLES.BILLING_ADMIN.bit, ROLES.ORG_OWNER.bit],

  // Scanner Settings
  "scanner.read":   [ROLES.VIEWER.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],
  "scanner.manage": [ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],

  // Reports
  "report.read":     [ROLES.VIEWER.bit, ROLES.ANALYST.bit, ROLES.ORG_OWNER.bit],
  "report.generate": [ROLES.ANALYST.bit, ROLES.SCAN_ADMIN.bit, ROLES.ORG_OWNER.bit],
};

// ──────────────────────────────────────────────────────────
// Team Scoping (future — defines which resources are team-scoped)
// ──────────────────────────────────────────────────────────

export const TEAM_SCOPED_RESOURCES = [
  "scan_jobs",
  "registry_configs",
  "scan_schedules",
  "notification_channels",
  "api_keys",
] as const;

export const ORG_WIDE_RESOURCES = [
  "scan_policies",    // Policies apply globally across the org
  "org_members",      // Membership is org-level
  "org_billing",      // Billing is org-level
] as const;

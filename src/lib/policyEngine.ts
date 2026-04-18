export interface PolicyRule {
  type: "severity_threshold" | "license_blocklist" | "package_blocklist" | "min_scan_age";
  action: "fail" | "warn";
  severity?: string;
  max_count?: number;
  licenses?: string[];
  packages?: string[];
  max_days?: number;
}

export interface PolicyResult {
  policy_id: string;
  policy_name: string;
  passed: boolean;
  rules_evaluated: number;
  failures: PolicyViolation[];
  warnings: PolicyViolation[];
}

export interface PolicyViolation {
  rule_type: string;
  message: string;
  details: Record<string, unknown>;
}

export function evaluatePolicy(
  rules: PolicyRule[],
  scanSummary: Record<string, unknown>,
): { failures: PolicyViolation[]; warnings: PolicyViolation[] } {
  const failures: PolicyViolation[] = [];
  const warnings: PolicyViolation[] = [];

  for (const rule of rules) {
    const violations = evaluateRule(rule, scanSummary);
    for (const v of violations) {
      if (rule.action === "fail") failures.push(v);
      else warnings.push(v);
    }
  }

  return { failures, warnings };
}

function evaluateRule(
  rule: PolicyRule,
  summary: Record<string, unknown>,
): PolicyViolation[] {
  switch (rule.type) {
    case "severity_threshold": {
      const sc = (summary.severity_counts as Record<string, number>) || {};
      const sev = (rule.severity || "").toLowerCase();
      const count = sc[sev] ?? (summary[sev] as number) ?? 0;
      const threshold = rule.max_count ?? 0;
      if (count > threshold) {
        return [
          {
            rule_type: rule.type,
            message: `${rule.severity} findings (${count}) exceed threshold (${threshold})`,
            details: { severity: rule.severity, count, threshold },
          },
        ];
      }
      return [];
    }

    case "license_blocklist": {
      const packages = (summary.packages as Array<Record<string, unknown>>) || [];
      const blocklist = rule.licenses || [];
      if (blocklist.length === 0) return [];
      const blocked = packages.filter(
        (p) => typeof p.license === "string" && blocklist.includes(p.license),
      );
      return blocked.map((p) => ({
        rule_type: rule.type,
        message: `Blocked license ${p.license} in ${p.name}`,
        details: { name: p.name, license: p.license, version: p.version },
      }));
    }

    case "package_blocklist": {
      const packages = (summary.packages as Array<Record<string, unknown>>) || [];
      const patterns = rule.packages || [];
      if (patterns.length === 0) return [];
      const violations: PolicyViolation[] = [];
      for (const p of packages) {
        const pName = String(p.name || "");
        const pVersion = String(p.version || "");
        for (const pattern of patterns) {
          if (matchesPackagePattern(pattern, pName, pVersion)) {
            violations.push({
              rule_type: rule.type,
              message: `Blocked package ${pName}@${pVersion} matches pattern ${pattern}`,
              details: { name: pName, version: pVersion, pattern },
            });
          }
        }
      }
      return violations;
    }

    case "min_scan_age": {
      const scannedAt = summary.scanned_at || summary.finished_at || summary.created_at;
      if (!scannedAt) return [];
      const scanDate = new Date(String(scannedAt));
      const daysSince = Math.floor(
        (Date.now() - scanDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const maxDays = rule.max_days ?? 30;
      if (daysSince > maxDays) {
        return [
          {
            rule_type: rule.type,
            message: `Scan is ${daysSince} days old (max ${maxDays})`,
            details: { days_since_scan: daysSince, max_days: maxDays },
          },
        ];
      }
      return [];
    }

    default:
      return [];
  }
}

function matchesPackagePattern(
  pattern: string,
  name: string,
  version: string,
): boolean {
  // Simple pattern: "package_name" or "package_name@<version_constraint"
  const atIdx = pattern.indexOf("@");
  if (atIdx === -1) {
    return name === pattern;
  }
  const patternName = pattern.slice(0, atIdx);
  const constraint = pattern.slice(atIdx + 1);
  if (patternName !== name) return false;
  if (!constraint) return true;
  // Simple version comparison for <X.Y.Z
  if (constraint.startsWith("<")) {
    const constraintVersion = constraint.slice(1);
    return compareVersions(version, constraintVersion) < 0;
  }
  if (constraint.startsWith(">=")) {
    const constraintVersion = constraint.slice(2);
    return compareVersions(version, constraintVersion) >= 0;
  }
  return version === constraint;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

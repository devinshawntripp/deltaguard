type SummaryJson = {
  summary?: {
    total_findings?: number;
    confirmed_total_findings?: number;
    heuristic_total_findings?: number;
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  target?: { type?: string };
  iso_profile?: {
    environment_name: string;
    environment: string;
    total_available_packages: number;
    default_install_packages: number;
    mandatory_groups: string[];
  };
  inventory_status?: string;
  scan_status?: string;
};

function SeverityPill({ label, count, color }: { label: string; count: number; color: string }) {
  if (count === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}: {count}
    </span>
  );
}

export default function ScanSummaryCard({ data }: { data: SummaryJson }) {
  const s = data.summary;
  if (!s) return null;

  const targetType = data.target?.type;
  const isIso = targetType === "iso";
  const hasProfile = !!data.iso_profile;
  const isHeuristic = !hasProfile && (s.heuristic_total_findings ?? 0) > 0 && (s.confirmed_total_findings ?? 0) === 0;

  return (
    <div className="surface-card p-4">
      <h3 className="text-sm font-semibold mb-3">Scan Summary</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <SeverityPill label="Critical" count={s.critical ?? 0} color="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200" />
        <SeverityPill label="High" count={s.high ?? 0} color="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200" />
        <SeverityPill label="Medium" count={s.medium ?? 0} color="bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200" />
        <SeverityPill label="Low" count={s.low ?? 0} color="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200" />
      </div>

      {hasProfile && (
        <p className="text-xs muted">
          {data.iso_profile!.default_install_packages.toLocaleString()} packages (default install profile) •{" "}
          <span className="text-teal-700 dark:text-teal-400 font-medium">Confirmed</span>
        </p>
      )}

      {isIso && !hasProfile && !isHeuristic && (
        <p className="text-xs px-2 py-1.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
          All available packages on ISO scanned. For more accurate results, re-scan with deep mode to filter to the default installation profile.
        </p>
      )}

      {isHeuristic && (
        <p className="text-xs px-2 py-1.5 rounded bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200">
          Package list estimated from filenames. Results may include false positives.
        </p>
      )}
    </div>
  );
}

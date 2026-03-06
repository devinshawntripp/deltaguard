type IsoProfile = {
  environment_name: string;
  environment: string;
  total_available_packages: number;
  default_install_packages: number;
  mandatory_groups: string[];
};

export default function IsoProfileCard({ profile }: { profile: IsoProfile }) {
  return (
    <div className="surface-card p-4">
      <h3 className="text-sm font-semibold mb-3">Installation Profile</h3>
      <div className="grid gap-2 text-sm">
        <div>
          <span className="muted">Environment:</span>{" "}
          <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs font-medium">
            {profile.environment_name}
          </span>
        </div>
        <div>
          <span className="muted">Packages:</span>{" "}
          {profile.default_install_packages.toLocaleString()} of{" "}
          {profile.total_available_packages.toLocaleString()} (default install)
        </div>
        {profile.mandatory_groups.length > 0 && (
          <div>
            <span className="muted">Groups:</span>{" "}
            <span className="flex flex-wrap gap-1 mt-1">
              {profile.mandatory_groups.map((g) => (
                <span
                  key={g}
                  className="inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-xs"
                >
                  {g}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

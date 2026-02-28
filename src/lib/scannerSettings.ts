import { z } from "zod";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const scannerSettingsSchema = z.object({
    mode_default: z.enum(["light", "deep"]).default("light"),
    light_allow_heuristic_fallback: z.boolean().default(true),
    deep_require_installed_inventory: z.boolean().default(true),
    nvd_enrich_enabled: z.boolean().default(true),
    osv_enrich_enabled: z.boolean().default(true),
    redhat_enrich_enabled: z.boolean().default(true),
    epss_enrich_enabled: z.boolean().default(true),
    kev_enrich_enabled: z.boolean().default(true),
    debian_tracker_enabled: z.boolean().default(true),
    ubuntu_tracker_enabled: z.boolean().default(true),
    alpine_secdb_enabled: z.boolean().default(true),
    redhat_unfixed_enabled: z.boolean().default(true),
    skip_cache: z.boolean().default(false),
    nvd_api_key: z.string().default(""),
    nvd_concurrency: z.number().int().min(1).max(20).default(3),
    nvd_retry_max: z.number().int().min(1).max(12).default(5),
    nvd_timeout_secs: z.number().int().min(5).max(120).default(20),
    global_nvd_rate_per_minute: z.number().int().min(1).max(240).default(40),
    osv_batch_size: z.number().int().min(10).max(200).default(50),
    osv_timeout_secs: z.number().int().min(10).max(120).default(60),
    redhat_cve_concurrency: z.number().int().min(1).max(8).default(4),
});

export type ScannerSettings = z.infer<typeof scannerSettingsSchema>;

const defaults = scannerSettingsSchema.parse({});

export async function getScannerSettings(orgId: string): Promise<ScannerSettings> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>> & Array<ScannerSettings>>`
SELECT
  mode_default,
  light_allow_heuristic_fallback,
  deep_require_installed_inventory,
  nvd_enrich_enabled,
  osv_enrich_enabled,
  redhat_enrich_enabled,
  epss_enrich_enabled,
  kev_enrich_enabled,
  debian_tracker_enabled,
  ubuntu_tracker_enabled,
  alpine_secdb_enabled,
  redhat_unfixed_enabled,
  skip_cache,
  nvd_api_key,
  nvd_concurrency,
  nvd_retry_max,
  nvd_timeout_secs,
  global_nvd_rate_per_minute,
  osv_batch_size,
  osv_timeout_secs,
  redhat_cve_concurrency
FROM scanner_settings
WHERE org_id=${orgId}::uuid
LIMIT 1
    `;

    if (!rows[0]) {
        await prisma.$executeRaw`
INSERT INTO scanner_settings (org_id)
VALUES (${orgId}::uuid)
ON CONFLICT (org_id) DO NOTHING
        `;
        return defaults;
    }

    return scannerSettingsSchema.parse(rows[0]);
}

export async function setScannerSettings(orgId: string, input: unknown): Promise<ScannerSettings> {
    await ensurePlatformSchema();
    const parsed = scannerSettingsSchema.parse(input);

    await prisma.$executeRaw`
INSERT INTO scanner_settings (
  org_id,
  mode_default,
  light_allow_heuristic_fallback,
  deep_require_installed_inventory,
  nvd_enrich_enabled,
  osv_enrich_enabled,
  redhat_enrich_enabled,
  epss_enrich_enabled,
  kev_enrich_enabled,
  debian_tracker_enabled,
  ubuntu_tracker_enabled,
  alpine_secdb_enabled,
  redhat_unfixed_enabled,
  skip_cache,
  nvd_api_key,
  nvd_concurrency,
  nvd_retry_max,
  nvd_timeout_secs,
  global_nvd_rate_per_minute,
  osv_batch_size,
  osv_timeout_secs,
  redhat_cve_concurrency,
  updated_at
)
VALUES (
  ${orgId}::uuid,
  ${parsed.mode_default},
  ${parsed.light_allow_heuristic_fallback},
  ${parsed.deep_require_installed_inventory},
  ${parsed.nvd_enrich_enabled},
  ${parsed.osv_enrich_enabled},
  ${parsed.redhat_enrich_enabled},
  ${parsed.epss_enrich_enabled},
  ${parsed.kev_enrich_enabled},
  ${parsed.debian_tracker_enabled},
  ${parsed.ubuntu_tracker_enabled},
  ${parsed.alpine_secdb_enabled},
  ${parsed.redhat_unfixed_enabled},
  ${parsed.skip_cache},
  ${parsed.nvd_api_key},
  ${parsed.nvd_concurrency},
  ${parsed.nvd_retry_max},
  ${parsed.nvd_timeout_secs},
  ${parsed.global_nvd_rate_per_minute},
  ${parsed.osv_batch_size},
  ${parsed.osv_timeout_secs},
  ${parsed.redhat_cve_concurrency},
  now()
)
ON CONFLICT (org_id)
DO UPDATE SET
  mode_default = EXCLUDED.mode_default,
  light_allow_heuristic_fallback = EXCLUDED.light_allow_heuristic_fallback,
  deep_require_installed_inventory = EXCLUDED.deep_require_installed_inventory,
  nvd_enrich_enabled = EXCLUDED.nvd_enrich_enabled,
  osv_enrich_enabled = EXCLUDED.osv_enrich_enabled,
  redhat_enrich_enabled = EXCLUDED.redhat_enrich_enabled,
  epss_enrich_enabled = EXCLUDED.epss_enrich_enabled,
  kev_enrich_enabled = EXCLUDED.kev_enrich_enabled,
  debian_tracker_enabled = EXCLUDED.debian_tracker_enabled,
  ubuntu_tracker_enabled = EXCLUDED.ubuntu_tracker_enabled,
  alpine_secdb_enabled = EXCLUDED.alpine_secdb_enabled,
  redhat_unfixed_enabled = EXCLUDED.redhat_unfixed_enabled,
  skip_cache = EXCLUDED.skip_cache,
  nvd_api_key = EXCLUDED.nvd_api_key,
  nvd_concurrency = EXCLUDED.nvd_concurrency,
  nvd_retry_max = EXCLUDED.nvd_retry_max,
  nvd_timeout_secs = EXCLUDED.nvd_timeout_secs,
  global_nvd_rate_per_minute = EXCLUDED.global_nvd_rate_per_minute,
  osv_batch_size = EXCLUDED.osv_batch_size,
  osv_timeout_secs = EXCLUDED.osv_timeout_secs,
  redhat_cve_concurrency = EXCLUDED.redhat_cve_concurrency,
  updated_at = now()
    `;

    return parsed;
}

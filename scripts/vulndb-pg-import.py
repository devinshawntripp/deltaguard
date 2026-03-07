#!/usr/bin/env python3
"""
vulndb-pg-import.py — Bulk-import vulnerability data into PostgreSQL and export
a compressed SQLite DB to MinIO for CLI users.

Pipeline:
  1. Check revalidation schedule per source (skip sources that are fresh enough)
  2. Download fresh data, diff against PG, upsert only new/changed rows
  3. Export PG enrichment cache → SQLite DB (matching Rust scanner schema)
  4. Upload raw SQLite to MinIO for CLI 'scanrook db fetch' users
     (payloads inside are already zstd-compressed, no outer compression needed)

Env vars:
  DATABASE_URL       PostgreSQL connection string (required)
  NVD_API_KEY        NVD API key for higher rate limits (optional)
  S3_ENDPOINT        MinIO endpoint, e.g. minio.storage.svc:9000 (required)
  S3_ACCESS_KEY      MinIO access key (required)
  S3_SECRET_KEY      MinIO secret key (required)
  S3_USE_SSL         "true"/"false" (default: false)
  VULNDB_BUCKET      MinIO bucket for SQLite DBs (default: vulndb)
  HTTP_PROXY / HTTPS_PROXY  Proxy for outbound API requests (optional)
  IMPORT_NVD         Set to "0" to skip (default: "1")
  IMPORT_OSV         Set to "0" to skip (default: "1")
  IMPORT_EPSS        Set to "0" to skip (default: "1")
  IMPORT_KEV         Set to "0" to skip (default: "1")
  IMPORT_DEBIAN      Set to "0" to skip (default: "1")
  IMPORT_UBUNTU      Set to "0" to skip (default: "1")
  IMPORT_ALPINE      Set to "0" to skip (default: "1")
  IMPORT_OVAL        Set to "0" to skip Red Hat OVAL import (default: "1")
  FORCE_REFRESH      Set to "1" to ignore staleness checks and refresh all (default: "0")
  SKIP_SQLITE_EXPORT Set to "1" to skip SQLite export + MinIO upload (default: "0")
"""

import csv
import gzip
import io
import json
import logging
import os
import sqlite3
import sys
import tempfile
import time
import zipfile
from datetime import datetime, timedelta, timezone
from urllib.parse import quote as urlquote

import psycopg2
import psycopg2.extras
import requests
import zstandard as zstd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
log = logging.getLogger("vulndb-pg-import")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CHUNK_SIZE = 1000

# Revalidation schedule: how often each source should be refreshed.
# Based on upstream update frequencies.
REVALIDATION_HOURS = {
    "nvd": 8,       # NVD updates continuously; 8h incremental catches most changes
    "osv": 24,      # OSV ecosystem zips rebuilt ~daily
    "epss": 24,     # EPSS scores published daily
    "kev": 12,      # KEV updated as needed, check twice daily
    "debian": 24,   # Debian tracker updated daily
    "ubuntu": 48,   # Ubuntu USN API, less frequent
    "alpine": 48,   # Alpine SecDB, less frequent
    "oval": 24,     # Red Hat OVAL V2, updated daily
}

# OSV ecosystems to download (must match Rust scanner's osv_ecosystem_zips)
OSV_ECOSYSTEMS = [
    ("Alpine", "Alpine"),
    ("Debian", "Debian"),
    ("Ubuntu", "Ubuntu"),
    ("AlmaLinux", "AlmaLinux"),
    ("Rocky Linux", "Rocky Linux"),
    ("SUSE", "SUSE"),
    ("Red Hat", "Red Hat"),
    ("crates.io", "crates.io"),
    ("Go", "Go"),
    ("npm", "npm"),
    ("PyPI", "PyPI"),
    ("Maven", "Maven"),
    ("NuGet", "NuGet"),
    ("Packagist", "Packagist"),
    ("RubyGems", "RubyGems"),
    ("Hex", "Hex"),
    ("Pub", "Pub"),
    ("SwiftURL", "SwiftURL"),
    ("Linux", "Linux"),
    ("OSS-Fuzz", "OSS-Fuzz"),
    ("GSD", "GSD"),
    ("GitHub Actions", "GitHub Actions"),
    ("Chainguard", "Chainguard"),
    ("Wolfi", "Wolfi"),
]

ALPINE_BRANCHES = ["v3.17", "v3.18", "v3.19", "v3.20", "v3.21", "edge"]
ALPINE_REPOS = ["main", "community"]

# SQLite schema matching what the Rust scanner query functions expect
SQLITE_SCHEMA = """
CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS osv_packages (ecosystem TEXT, name TEXT, PRIMARY KEY (ecosystem, name));

CREATE TABLE IF NOT EXISTS osv_vulns (
    id TEXT, ecosystem TEXT, name TEXT,
    modified TEXT,
    PRIMARY KEY (id, ecosystem, name)
);
CREATE INDEX IF NOT EXISTS idx_osv_eco_name ON osv_vulns (ecosystem, name);

CREATE TABLE IF NOT EXISTS osv_payloads (
    id TEXT PRIMARY KEY,
    payload BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS nvd_cves (
    cve_id TEXT PRIMARY KEY,
    payload BLOB NOT NULL,
    last_modified TEXT
);

CREATE TABLE IF NOT EXISTS epss_scores (cve_id TEXT PRIMARY KEY, score REAL, percentile REAL);

CREATE TABLE IF NOT EXISTS kev_entries (cve_id TEXT PRIMARY KEY);

CREATE TABLE IF NOT EXISTS debian_tracker (
    cve_id TEXT, package TEXT, release TEXT,
    status TEXT, urgency TEXT, fixed_version TEXT,
    PRIMARY KEY (cve_id, package, release)
);
CREATE INDEX IF NOT EXISTS idx_debian_pkg_release ON debian_tracker (package, release);

CREATE TABLE IF NOT EXISTS ubuntu_usn (
    cve_id TEXT NOT NULL, package TEXT NOT NULL, release TEXT NOT NULL,
    status TEXT, priority TEXT,
    PRIMARY KEY (cve_id, package, release)
);
CREATE INDEX IF NOT EXISTS idx_ubuntu_pkg_release ON ubuntu_usn (package, release);

CREATE TABLE IF NOT EXISTS alpine_secdb (
    cve_id TEXT NOT NULL, package TEXT NOT NULL, branch TEXT NOT NULL,
    repo TEXT NOT NULL, fixed_version TEXT,
    PRIMARY KEY (cve_id, package, branch, repo)
);
CREATE INDEX IF NOT EXISTS idx_alpine_pkg_branch ON alpine_secdb (package, branch);
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def enabled(var: str) -> bool:
    return os.environ.get(var, "1") != "0"


def force_refresh() -> bool:
    return os.environ.get("FORCE_REFRESH", "0") == "1"


def pg_connect(db_url: str, max_attempts: int = 5) -> "psycopg2.connection":
    """Connect to PostgreSQL with retry + exponential backoff.

    Handles CNPG failovers where the -rw service briefly has no target.
    """
    for attempt in range(1, max_attempts + 1):
        try:
            conn = psycopg2.connect(db_url)
            conn.set_session(autocommit=False)
            return conn
        except psycopg2.OperationalError as e:
            if attempt == max_attempts:
                raise
            wait = min(5 * (2 ** (attempt - 1)), 60)  # 5, 10, 20, 40, 60
            log.warning("PG connect attempt %d/%d failed: %s — retrying in %ds",
                        attempt, max_attempts, e, wait)
            time.sleep(wait)
    raise RuntimeError("unreachable")


def get_session() -> requests.Session:
    s = requests.Session()
    s.headers["User-Agent"] = "scanrook-vulndb-import/1.0"
    # NVD API key is passed per-request in nvd_request_with_retry(),
    # NOT on the session — other APIs (Ubuntu, etc.) reject unknown headers.
    return s


def ensure_pg_tables(conn):
    """Create enrichment cache tables if they don't exist."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS nvd_cve_cache (
                cve_id TEXT PRIMARY KEY,
                payload JSONB NOT NULL,
                last_checked_at TIMESTAMPTZ NOT NULL,
                nvd_last_modified TIMESTAMPTZ
            );
            CREATE TABLE IF NOT EXISTS osv_vuln_cache (
                vuln_id TEXT PRIMARY KEY,
                payload JSONB NOT NULL,
                last_checked_at TIMESTAMPTZ NOT NULL,
                osv_last_modified TIMESTAMPTZ
            );
            CREATE TABLE IF NOT EXISTS epss_scores_cache (
                cve_id TEXT PRIMARY KEY,
                score REAL NOT NULL,
                percentile REAL NOT NULL,
                last_checked_at TIMESTAMPTZ NOT NULL
            );
            CREATE TABLE IF NOT EXISTS kev_entries_cache (
                cve_id TEXT PRIMARY KEY,
                last_checked_at TIMESTAMPTZ NOT NULL
            );
            CREATE TABLE IF NOT EXISTS debian_tracker_cache (
                cve_id TEXT NOT NULL,
                package TEXT NOT NULL,
                release TEXT NOT NULL,
                status TEXT,
                urgency TEXT,
                fixed_version TEXT,
                last_checked_at TIMESTAMPTZ NOT NULL,
                PRIMARY KEY (cve_id, package, release)
            );
            CREATE TABLE IF NOT EXISTS ubuntu_usn_cache (
                cve_id TEXT NOT NULL,
                package TEXT NOT NULL,
                release TEXT NOT NULL,
                status TEXT,
                priority TEXT,
                last_checked_at TIMESTAMPTZ NOT NULL,
                PRIMARY KEY (cve_id, package, release)
            );
            CREATE TABLE IF NOT EXISTS alpine_secdb_cache (
                cve_id TEXT NOT NULL,
                package TEXT NOT NULL,
                branch TEXT NOT NULL,
                repo TEXT NOT NULL,
                fixed_version TEXT,
                last_checked_at TIMESTAMPTZ NOT NULL,
                PRIMARY KEY (cve_id, package, branch, repo)
            );
            CREATE TABLE IF NOT EXISTS oval_definitions_cache (
                id SERIAL PRIMARY KEY,
                rhel_version INT NOT NULL,
                definition_id TEXT NOT NULL,
                cves TEXT[] NOT NULL,
                test_refs TEXT[] NOT NULL,
                severity TEXT,
                issued_date TIMESTAMPTZ,
                last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(rhel_version, definition_id)
            );
            CREATE TABLE IF NOT EXISTS oval_test_constraints_cache (
                id SERIAL PRIMARY KEY,
                rhel_version INT NOT NULL,
                test_ref TEXT NOT NULL,
                package TEXT NOT NULL,
                op TEXT NOT NULL,
                evr TEXT NOT NULL,
                last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(rhel_version, test_ref, package)
            );
        """)
    conn.commit()
    log.info("Ensured PG cache tables exist")


def source_is_stale(conn, source: str) -> bool:
    """Check if a source needs refreshing based on its revalidation schedule."""
    if force_refresh():
        return True
    max_age_hours = REVALIDATION_HOURS.get(source, 24)
    cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)

    table_map = {
        "nvd": ("nvd_cve_cache", "last_checked_at"),
        "osv": ("osv_vuln_cache", "last_checked_at"),
        "epss": ("epss_scores_cache", "last_checked_at"),
        "kev": ("kev_entries_cache", "last_checked_at"),
        "debian": ("debian_tracker_cache", "last_checked_at"),
        "ubuntu": ("ubuntu_usn_cache", "last_checked_at"),
        "alpine": ("alpine_secdb_cache", "last_checked_at"),
        "oval": ("oval_definitions_cache", "last_checked_at"),
    }
    table, col = table_map.get(source, (None, None))
    if not table:
        return True

    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT MAX({col}) FROM {table}")
            row = cur.fetchone()
            if row is None or row[0] is None:
                return True  # empty table → definitely stale
            last_ts = row[0]
            if last_ts.tzinfo is None:
                last_ts = last_ts.replace(tzinfo=timezone.utc)
            stale = last_ts < cutoff
            if not stale:
                log.info("%s: fresh (last_checked=%s, max_age=%dh), skipping",
                         source, last_ts.isoformat(), max_age_hours)
            return stale
    except Exception:
        return True  # table doesn't exist yet → stale


ZSTD_LEVEL = 15
DICT_SAMPLE_SIZE = 10000  # number of payloads to sample for dictionary training
DICT_SIZE = 131072        # 128 KB dictionary


def zstd_compress(data: bytes, cctx=None) -> bytes:
    """Compress with zstd. Uses provided compressor (dict-aware) or standalone."""
    if cctx is None:
        cctx = zstd.ZstdCompressor(level=ZSTD_LEVEL)
    return cctx.compress(data)


def train_zstd_dict(samples: list[bytes]) -> zstd.ZstdCompressionDict:
    """Train a zstd dictionary from a list of raw payload samples."""
    log.info("Training zstd dictionary from %d samples (%d bytes total)...",
             len(samples), sum(len(s) for s in samples))
    t0 = time.time()
    dict_data = zstd.train_dictionary(DICT_SIZE, samples)
    log.info("Dictionary trained in %.1fs (%d bytes)", time.time() - t0, len(dict_data.as_bytes()))
    return dict_data


def strip_osv_unused_fields(vuln: dict) -> dict:
    """Strip bulky unused fields from OSV vulns to reduce payload size.
    Matches the Rust scanner's strip_osv_unused_fields() exactly:
    - Keeps: id, modified, summary, details, aliases, severity, references
    - From database_specific: only severity
    - From affected[]: only package + ranges (type + fixed events only)
    - Drops: published, schema_version, versions, ecosystem_specific, etc.
    """
    out = {}
    for key in ("id", "modified", "summary", "details", "aliases", "severity", "references"):
        if key in vuln:
            out[key] = vuln[key]

    # database_specific — keep only severity
    db_spec = vuln.get("database_specific")
    if isinstance(db_spec, dict) and "severity" in db_spec:
        out["database_specific"] = {"severity": db_spec["severity"]}

    # affected[] — keep package + stripped ranges (type + fixed events only)
    affected = vuln.get("affected")
    if isinstance(affected, list):
        stripped = []
        for aff in affected:
            s = {}
            if "package" in aff:
                s["package"] = aff["package"]
            ranges = aff.get("ranges")
            if isinstance(ranges, list):
                sr_list = []
                for r in ranges:
                    sr = {}
                    if "type" in r:
                        sr["type"] = r["type"]
                    events = r.get("events")
                    if isinstance(events, list):
                        fixed_events = [e for e in events if "fixed" in e]
                        if fixed_events:
                            sr["events"] = fixed_events
                    sr_list.append(sr)
                s["ranges"] = sr_list
            stripped.append(s)
        out["affected"] = stripped

    return out


def strip_nvd_unused_fields(cve: dict) -> dict:
    """Strip bulky unused fields from NVD CVE payloads for SQLite export.
    The Rust scanner only reads: descriptions (English), metrics
    (cvssMetricV31/V30/V2), and configurations. Everything else is dropped."""
    out = {}

    # Keep only id and sourceIdentifier
    for key in ("id", "sourceIdentifier", "published", "lastModified"):
        if key in cve:
            out[key] = cve[key]

    # descriptions — English only
    descriptions = cve.get("descriptions")
    if isinstance(descriptions, list):
        en_descs = [d for d in descriptions if d.get("lang") == "en"]
        if en_descs:
            out["descriptions"] = en_descs

    # metrics — only cvssMetricV31, cvssMetricV30, cvssMetricV2
    metrics = cve.get("metrics")
    if isinstance(metrics, dict):
        stripped_metrics = {}
        for key in ("cvssMetricV31", "cvssMetricV30", "cvssMetricV2"):
            if key in metrics:
                stripped_metrics[key] = metrics[key]
        if stripped_metrics:
            out["metrics"] = stripped_metrics

    # configurations — keep as-is (used for CPE matching)
    if "configurations" in cve:
        out["configurations"] = cve["configurations"]

    return out


def nvd_request_with_retry(session, url, max_attempts=5):
    """Make an NVD API request with retry + backoff for rate limits."""
    headers = {}
    api_key = os.environ.get("NVD_API_KEY")
    if api_key:
        headers["apiKey"] = api_key
    for attempt in range(max_attempts):
        try:
            resp = session.get(url, timeout=120, headers=headers)
            if resp.status_code == 403:
                wait = 30 * (attempt + 1)
                log.warning("NVD rate limited (403), waiting %ds...", wait)
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp
        except requests.RequestException as e:
            wait = 10 * (attempt + 1)
            log.warning("NVD request error: %s, retrying in %ds...", e, wait)
            time.sleep(wait)
    return None


# ---------------------------------------------------------------------------
# NVD Import (incremental via lastModStartDate)
# ---------------------------------------------------------------------------

NVD_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0"
NVD_PAGE_SIZE = 2000


def import_nvd(conn, session: requests.Session):
    log.info("=== NVD import starting ===")

    # Determine incremental vs full: only use incremental if we have a
    # substantial number of rows (>100K). Otherwise do a full import.
    last_modified_str = None
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM nvd_cve_cache")
        nvd_count = cur.fetchone()[0]
        if nvd_count > 100000 and not force_refresh():
            cur.execute("SELECT MAX(nvd_last_modified) FROM nvd_cve_cache")
            row = cur.fetchone()
            if row and row[0]:
                last_modified_str = row[0].strftime("%Y-%m-%dT%H:%M:%S.000")
                log.info("NVD: %d rows in cache, using incremental since %s",
                         nvd_count, last_modified_str)
        else:
            log.info("NVD: %d rows in cache (< 100K or force_refresh), doing full import",
                     nvd_count)

    start_index = 0
    total_inserted = 0
    total_results = None

    while True:
        url = f"{NVD_BASE}?startIndex={start_index}&resultsPerPage={NVD_PAGE_SIZE}"
        if last_modified_str:
            url += f"&lastModStartDate={last_modified_str}&lastModEndDate={datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000')}"

        resp = nvd_request_with_retry(session, url)
        if resp is None:
            log.error("NVD: giving up after retries at startIndex=%d", start_index)
            break

        data = resp.json()
        if total_results is None:
            total_results = data.get("totalResults", 0)
            mode = "incremental" if last_modified_str else "full"
            log.info("NVD %s: %d CVEs to process (since %s)",
                     mode, total_results, last_modified_str or "beginning")

        vulns = data.get("vulnerabilities", [])
        if not vulns:
            break

        now = datetime.now(timezone.utc)
        rows = []
        for item in vulns:
            cve = item.get("cve", {})
            cve_id = cve.get("id")
            if not cve_id:
                continue
            last_mod = cve.get("lastModified")
            rows.append((cve_id, json.dumps(cve), now, last_mod))

        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                """INSERT INTO nvd_cve_cache (cve_id, payload, last_checked_at, nvd_last_modified)
                   VALUES %s
                   ON CONFLICT (cve_id) DO UPDATE SET
                       payload = EXCLUDED.payload,
                       last_checked_at = EXCLUDED.last_checked_at,
                       nvd_last_modified = EXCLUDED.nvd_last_modified""",
                rows,
                template="(%s, %s::jsonb, %s, %s)",
                page_size=CHUNK_SIZE,
            )
        conn.commit()
        total_inserted += len(rows)

        log.info("NVD: %d/%d (%.1f%%)",
                 start_index + len(vulns), total_results,
                 (start_index + len(vulns)) / max(total_results, 1) * 100)

        start_index += NVD_PAGE_SIZE
        if start_index >= total_results:
            break

        sleep_time = 0.6 if not os.environ.get("NVD_API_KEY") else 0.1
        time.sleep(sleep_time)

    log.info("NVD import done: %d CVEs upserted", total_inserted)
    return total_inserted


# ---------------------------------------------------------------------------
# OSV Import (diff-based: skip vulns with same modified timestamp)
# ---------------------------------------------------------------------------

OSV_ZIP_URL = "https://osv-vulnerabilities.storage.googleapis.com/{ecosystem}/all.zip"


def import_osv(conn, session: requests.Session):
    log.info("=== OSV import starting ===")
    total_inserted = 0
    total_skipped = 0

    for eco_name, eco_id in OSV_ECOSYSTEMS:
        url = OSV_ZIP_URL.format(ecosystem=urlquote(eco_name))
        log.info("OSV: downloading %s...", eco_name)
        try:
            resp = session.get(url, timeout=300)
            resp.raise_for_status()
        except requests.RequestException as e:
            log.warning("OSV: failed to download %s: %s", eco_name, e)
            continue

        try:
            zf = zipfile.ZipFile(io.BytesIO(resp.content))
        except zipfile.BadZipFile:
            log.warning("OSV: bad zip for %s, skipping", eco_name)
            continue

        # Load existing modified timestamps for diff comparison
        existing_modified = {}
        with conn.cursor() as cur:
            cur.execute("SELECT vuln_id, osv_last_modified FROM osv_vuln_cache")
            for row in cur:
                if row[1]:
                    existing_modified[row[0]] = str(row[1])

        now = datetime.now(timezone.utc)
        rows = []
        eco_skipped = 0

        for name in zf.namelist():
            if not name.endswith(".json"):
                continue
            try:
                vuln = json.loads(zf.read(name))
            except (json.JSONDecodeError, KeyError):
                continue
            vuln_id = vuln.get("id")
            if not vuln_id:
                continue
            osv_modified = vuln.get("modified", "")

            # Diff check: skip if modified timestamp hasn't changed
            if vuln_id in existing_modified:
                existing_ts = existing_modified[vuln_id]
                if osv_modified and existing_ts and osv_modified in existing_ts:
                    eco_skipped += 1
                    continue

            rows.append((vuln_id, json.dumps(vuln), now, osv_modified))
            if len(rows) >= CHUNK_SIZE:
                _upsert_osv_batch(conn, rows)
                total_inserted += len(rows)
                rows = []

        if rows:
            _upsert_osv_batch(conn, rows)
            total_inserted += len(rows)

        total_skipped += eco_skipped
        log.info("OSV: %s done (upserted=%d, skipped_unchanged=%d)",
                 eco_name, total_inserted, eco_skipped)

    log.info("OSV import done: %d upserted, %d unchanged skipped",
             total_inserted, total_skipped)
    return total_inserted


def _upsert_osv_batch(conn, rows):
    with conn.cursor() as cur:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO osv_vuln_cache (vuln_id, payload, last_checked_at, osv_last_modified)
               VALUES %s
               ON CONFLICT (vuln_id) DO UPDATE SET
                   payload = EXCLUDED.payload,
                   last_checked_at = EXCLUDED.last_checked_at,
                   osv_last_modified = EXCLUDED.osv_last_modified""",
            rows,
            template="(%s, %s::jsonb, %s, %s)",
            page_size=CHUNK_SIZE,
        )
    conn.commit()


# ---------------------------------------------------------------------------
# EPSS Import
# ---------------------------------------------------------------------------

EPSS_URL = "https://epss.cyentia.com/epss_scores-current.csv.gz"


def import_epss(conn, session: requests.Session):
    log.info("=== EPSS import starting ===")
    try:
        resp = session.get(EPSS_URL, timeout=120)
        resp.raise_for_status()
    except requests.RequestException as e:
        log.error("EPSS download failed: %s", e)
        return 0

    raw = gzip.decompress(resp.content).decode("utf-8")
    reader = csv.reader(io.StringIO(raw))

    now = datetime.now(timezone.utc)
    rows = []
    total_inserted = 0

    for line in reader:
        if not line or line[0].startswith("#") or line[0] == "cve":
            continue
        if len(line) < 3:
            continue
        cve_id = line[0].strip()
        if not cve_id.startswith("CVE-"):
            continue
        try:
            score = float(line[1])
            percentile = float(line[2])
        except (ValueError, IndexError):
            continue
        rows.append((cve_id, score, percentile, now))

        if len(rows) >= CHUNK_SIZE:
            _upsert_epss_batch(conn, rows)
            total_inserted += len(rows)
            rows = []

    if rows:
        _upsert_epss_batch(conn, rows)
        total_inserted += len(rows)

    log.info("EPSS import done: %d scores upserted", total_inserted)
    return total_inserted


def _upsert_epss_batch(conn, rows):
    with conn.cursor() as cur:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO epss_scores_cache (cve_id, score, percentile, last_checked_at)
               VALUES %s
               ON CONFLICT (cve_id) DO UPDATE SET
                   score = EXCLUDED.score,
                   percentile = EXCLUDED.percentile,
                   last_checked_at = EXCLUDED.last_checked_at""",
            rows,
            page_size=CHUNK_SIZE,
        )
    conn.commit()


# ---------------------------------------------------------------------------
# KEV Import
# ---------------------------------------------------------------------------

KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"


def import_kev(conn, session: requests.Session):
    log.info("=== KEV import starting ===")
    try:
        resp = session.get(KEV_URL, timeout=60)
        resp.raise_for_status()
    except requests.RequestException as e:
        log.error("KEV download failed: %s", e)
        return 0

    data = resp.json()
    vulns = data.get("vulnerabilities", [])
    now = datetime.now(timezone.utc)

    # Diff: load existing KEV entries
    existing = set()
    with conn.cursor() as cur:
        cur.execute("SELECT cve_id FROM kev_entries_cache")
        existing = {r[0] for r in cur}

    new_entries = [(v["cveID"], now) for v in vulns
                   if "cveID" in v and v["cveID"] not in existing]

    if new_entries:
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                """INSERT INTO kev_entries_cache (cve_id, last_checked_at)
                   VALUES %s
                   ON CONFLICT (cve_id) DO UPDATE SET
                       last_checked_at = EXCLUDED.last_checked_at""",
                new_entries,
                page_size=CHUNK_SIZE,
            )
        conn.commit()

    # Update last_checked_at on all existing entries too
    with conn.cursor() as cur:
        cur.execute("UPDATE kev_entries_cache SET last_checked_at = %s", (now,))
    conn.commit()

    log.info("KEV import done: %d new entries, %d total",
             len(new_entries), len(vulns))
    return len(new_entries)


# ---------------------------------------------------------------------------
# Debian Security Tracker Import
# ---------------------------------------------------------------------------

DEBIAN_TRACKER_URL = "https://security-tracker.debian.org/tracker/data/json"


def import_debian(conn, session: requests.Session):
    log.info("=== Debian tracker import starting ===")
    try:
        resp = session.get(DEBIAN_TRACKER_URL, timeout=120)
        resp.raise_for_status()
    except requests.RequestException as e:
        log.error("Debian tracker download failed: %s", e)
        return 0

    data = resp.json()
    now = datetime.now(timezone.utc)
    rows = []
    total = 0

    # Format: { "package": { "CVE-xxxx": { "releases": { "bookworm": { "status": ..., "urgency": ..., "fixed_version": ... } } } } }
    for pkg, cves in data.items():
        if not isinstance(cves, dict):
            continue
        for cve_id, info in cves.items():
            if not isinstance(info, dict):
                continue
            releases = info.get("releases", {})
            if not isinstance(releases, dict):
                continue
            for release, details in releases.items():
                status = details.get("status", "") if isinstance(details, dict) else ""
                urgency = details.get("urgency", "") if isinstance(details, dict) else ""
                fixed_version = details.get("fixed_version", "") if isinstance(details, dict) else ""
                rows.append((cve_id, pkg, release, status, urgency, fixed_version, now))
                if len(rows) >= CHUNK_SIZE:
                    _upsert_debian_batch(conn, rows)
                    total += len(rows)
                    rows = []

    if rows:
        _upsert_debian_batch(conn, rows)
        total += len(rows)

    log.info("Debian import done: %d entries upserted", total)
    return total


def _upsert_debian_batch(conn, rows):
    # Deduplicate by PK (cve_id, package, release)
    seen = {}
    for row in rows:
        key = (row[0], row[1], row[2])
        seen[key] = row
    deduped = list(seen.values())

    with conn.cursor() as cur:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO debian_tracker_cache
               (cve_id, package, release, status, urgency, fixed_version, last_checked_at)
               VALUES %s
               ON CONFLICT (cve_id, package, release) DO UPDATE SET
                   status = EXCLUDED.status,
                   urgency = EXCLUDED.urgency,
                   fixed_version = EXCLUDED.fixed_version,
                   last_checked_at = EXCLUDED.last_checked_at""",
            deduped,
            page_size=CHUNK_SIZE,
        )
    conn.commit()


# ---------------------------------------------------------------------------
# Ubuntu USN Import
# ---------------------------------------------------------------------------

UBUNTU_CVE_BASE = "https://ubuntu.com/security/cves.json"


def import_ubuntu(conn, session: requests.Session):
    log.info("=== Ubuntu CVE import starting ===")
    total = 0
    offset = 0
    limit = 20  # Ubuntu API max page size is 20

    while True:
        url = f"{UBUNTU_CVE_BASE}?limit={limit}&offset={offset}"
        try:
            resp = session.get(url, timeout=120)
            if resp.status_code in (422, 404, 500):
                log.warning("Ubuntu CVE API returned %d at offset %d, body=%s",
                            resp.status_code, offset, resp.text[:500])
                break
            resp.raise_for_status()
        except requests.RequestException as e:
            log.warning("Ubuntu CVE request failed at offset %d: %s", offset, e)
            break

        try:
            data = resp.json()
        except Exception:
            log.warning("Ubuntu CVE: non-JSON response at offset %d, stopping", offset)
            break

        cves = data.get("cves", data.get("results", []))
        if not cves:
            break

        now = datetime.now(timezone.utc)
        rows = []
        for cve_entry in cves:
            cve_id = cve_entry.get("id", cve_entry.get("cve_id", ""))
            if not cve_id.startswith("CVE-"):
                continue
            priority = cve_entry.get("priority", "")
            packages = cve_entry.get("packages", [])
            for pkg in packages:
                pkg_name = pkg.get("name", "")
                statuses = pkg.get("statuses", [])
                for st in statuses:
                    release = st.get("release_codename", st.get("release", ""))
                    status = st.get("status", "")
                    if pkg_name and release:
                        rows.append((cve_id, pkg_name, release, status, priority, now))

        if rows:
            _upsert_ubuntu_batch(conn, rows)
            total += len(rows)

        log.info("Ubuntu: offset=%d, batch=%d entries, total=%d", offset, len(rows), total)
        offset += limit

        if len(cves) < limit:
            break
        time.sleep(1.0)

    log.info("Ubuntu import done: %d entries upserted", total)
    return total


def _upsert_ubuntu_batch(conn, rows):
    # Deduplicate by PK (cve_id, package, release)
    seen = {}
    for row in rows:
        key = (row[0], row[1], row[2])
        seen[key] = row
    deduped = list(seen.values())

    with conn.cursor() as cur:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO ubuntu_usn_cache
               (cve_id, package, release, status, priority, last_checked_at)
               VALUES %s
               ON CONFLICT (cve_id, package, release) DO UPDATE SET
                   status = EXCLUDED.status,
                   priority = EXCLUDED.priority,
                   last_checked_at = EXCLUDED.last_checked_at""",
            deduped,
            page_size=CHUNK_SIZE,
        )
    conn.commit()


# ---------------------------------------------------------------------------
# Alpine SecDB Import
# ---------------------------------------------------------------------------

ALPINE_SECDB_URL = "https://secdb.alpinelinux.org/{branch}/{repo}.json"


def import_alpine(conn, session: requests.Session):
    log.info("=== Alpine SecDB import starting ===")
    total = 0
    now = datetime.now(timezone.utc)

    for branch in ALPINE_BRANCHES:
        for repo in ALPINE_REPOS:
            url = ALPINE_SECDB_URL.format(branch=branch, repo=repo)
            try:
                resp = session.get(url, timeout=60)
                if resp.status_code == 404:
                    continue
                resp.raise_for_status()
            except requests.RequestException as e:
                log.warning("Alpine: failed %s/%s: %s", branch, repo, e)
                continue

            data = resp.json()
            packages = data.get("packages", [])
            rows = []

            for pkg_entry in packages:
                pkg = pkg_entry.get("pkg", {})
                pkg_name = pkg.get("name", "")
                if not pkg_name:
                    continue
                secfixes = pkg.get("secfixes", {})
                for fixed_version, cves_list in secfixes.items():
                    if not isinstance(cves_list, list):
                        continue
                    for cve_id in cves_list:
                        if not isinstance(cve_id, str):
                            continue
                        if not (cve_id.startswith("CVE-") or cve_id.startswith("XSA-")):
                            continue
                        rows.append((cve_id, pkg_name, branch, repo, fixed_version, now))

            if rows:
                _upsert_alpine_batch(conn, rows)
                total += len(rows)

    log.info("Alpine import done: %d entries upserted", total)
    return total


def _upsert_alpine_batch(conn, rows):
    # Deduplicate by composite PK (cve_id, package, branch, repo) — Alpine secfixes
    # can list the same CVE under multiple fixed versions for the same package.
    # PG rejects duplicate keys within a single INSERT ... ON CONFLICT command.
    seen = {}
    for row in rows:
        key = (row[0], row[1], row[2], row[3])  # cve_id, package, branch, repo
        seen[key] = row  # last wins
    deduped = list(seen.values())

    with conn.cursor() as cur:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO alpine_secdb_cache
               (cve_id, package, branch, repo, fixed_version, last_checked_at)
               VALUES %s
               ON CONFLICT (cve_id, package, branch, repo) DO UPDATE SET
                   fixed_version = EXCLUDED.fixed_version,
                   last_checked_at = EXCLUDED.last_checked_at""",
            deduped,
            page_size=CHUNK_SIZE,
        )
    conn.commit()


# ---------------------------------------------------------------------------
# Red Hat OVAL V2 Import
# ---------------------------------------------------------------------------

OVAL_V2_URLS = {
    7: "https://access.redhat.com/security/data/oval/v2/RHEL7/rhel-7.oval.xml.bz2",
    8: "https://access.redhat.com/security/data/oval/v2/RHEL8/rhel-8.oval.xml.bz2",
    9: "https://access.redhat.com/security/data/oval/v2/RHEL9/rhel-9.oval.xml.bz2",
}


def import_redhat_oval(conn, session: requests.Session):
    """Import Red Hat OVAL V2 definitions for RHEL 7, 8, 9."""
    import bz2
    import re
    import xml.etree.ElementTree as ET

    log.info("=== Starting Red Hat OVAL import ===")
    total_defs = 0
    total_constraints = 0

    ns_linux = "http://oval.mitre.org/XMLSchema/oval-definitions-5#linux"
    ns_oval = "http://oval.mitre.org/XMLSchema/oval-definitions-5"
    cve_re = re.compile(r"CVE-\d{4}-\d+")

    for rhel_ver, url in OVAL_V2_URLS.items():
        log.info("Downloading OVAL for RHEL %d: %s", rhel_ver, url)
        t0 = time.time()
        try:
            resp = session.get(url, timeout=300)
            resp.raise_for_status()
            raw = bz2.decompress(resp.content)
        except Exception as e:
            log.error("RHEL %d OVAL download failed: %s", rhel_ver, e)
            continue
        log.info("RHEL %d: downloaded + decompressed in %.1fs (%d bytes)",
                 rhel_ver, time.time() - t0, len(raw))

        root = ET.fromstring(raw)

        # Build object_id → package_name map
        objects = {}
        for obj in root.iter(f"{{{ns_linux}}}rpminfo_object"):
            obj_id = obj.get("id", "")
            name_el = obj.find(f"{{{ns_linux}}}name")
            if name_el is not None and name_el.text:
                objects[obj_id] = name_el.text.strip()

        # Build state_id → (op, evr) map
        states = {}
        for st in root.iter(f"{{{ns_linux}}}rpminfo_state"):
            st_id = st.get("id", "")
            evr_el = st.find(f"{{{ns_linux}}}evr")
            if evr_el is not None and evr_el.text:
                op = evr_el.get("operation", "less than")
                op_code = {"less than": "LT", "less than or equal": "LE",
                           "equals": "EQ", "greater than or equal": "GE",
                           "greater than": "GT"}.get(op, "LT")
                states[st_id] = (op_code, evr_el.text.strip())

        # Parse tests → (test_id, package, op, evr)
        test_constraints = []
        for test in root.iter(f"{{{ns_linux}}}rpminfo_test"):
            test_id = test.get("id", "")
            obj_ref = test.find(f"{{{ns_linux}}}object")
            state_ref = test.find(f"{{{ns_linux}}}state")
            if obj_ref is not None and state_ref is not None:
                obj_id = obj_ref.get("object_ref", "")
                st_id = state_ref.get("state_ref", "")
                pkg = objects.get(obj_id)
                constraint = states.get(st_id)
                if pkg and constraint:
                    op, evr = constraint
                    test_constraints.append((test_id, pkg, op, evr))

        # Parse definitions
        definitions = []
        defs_el = root.find(f"{{{ns_oval}}}definitions")
        if defs_el is not None:
            for defn in defs_el.findall(f"{{{ns_oval}}}definition"):
                def_id = defn.get("id", "")
                metadata = defn.find(f"{{{ns_oval}}}metadata")
                cves = set()
                severity = None
                issued_date = None

                if metadata is not None:
                    for cve_el in metadata.iter():
                        if cve_el.tag.endswith("}cve") or cve_el.tag == "cve":
                            if cve_el.text:
                                cves.add(cve_el.text.strip())
                    title_el = metadata.find(f"{{{ns_oval}}}title")
                    if title_el is not None and title_el.text:
                        cves.update(cve_re.findall(title_el.text))

                    # Extract severity and date from advisory
                    for child in metadata:
                        if child.tag.endswith("}advisory") or child.tag == "advisory":
                            for sub in child:
                                if sub.tag.endswith("}severity") or sub.tag == "severity":
                                    if sub.text:
                                        severity = sub.text.strip()
                                if sub.tag.endswith("}issued") or sub.tag == "issued":
                                    date_str = sub.get("date", "")
                                    if date_str:
                                        try:
                                            issued_date = datetime.fromisoformat(
                                                date_str.replace("Z", "+00:00"))
                                        except ValueError:
                                            pass
                            break

                if not cves:
                    continue

                # Extract test refs from criteria tree
                test_refs = set()
                criteria = defn.find(f"{{{ns_oval}}}criteria")
                if criteria is not None:
                    for criterion in criteria.iter():
                        if criterion.tag.endswith("}criterion") or criterion.tag == "criterion":
                            tref = criterion.get("test_ref", "")
                            if tref:
                                test_refs.add(tref)

                definitions.append((def_id, list(cves), list(test_refs), severity, issued_date))

        # Batch upsert into PG
        now = datetime.now(timezone.utc)
        with conn.cursor() as cur:
            cur.execute("DELETE FROM oval_definitions_cache WHERE rhel_version = %s", (rhel_ver,))
            cur.execute("DELETE FROM oval_test_constraints_cache WHERE rhel_version = %s", (rhel_ver,))

            for i in range(0, len(definitions), CHUNK_SIZE):
                batch = definitions[i:i + CHUNK_SIZE]
                psycopg2.extras.execute_values(cur, """
                    INSERT INTO oval_definitions_cache
                        (rhel_version, definition_id, cves, test_refs, severity, issued_date, last_checked_at)
                    VALUES %s
                    ON CONFLICT (rhel_version, definition_id) DO UPDATE SET
                        cves = EXCLUDED.cves, test_refs = EXCLUDED.test_refs,
                        severity = EXCLUDED.severity, issued_date = EXCLUDED.issued_date,
                        last_checked_at = EXCLUDED.last_checked_at
                """, [(rhel_ver, d[0], d[1], d[2], d[3], d[4], now) for d in batch])

            for i in range(0, len(test_constraints), CHUNK_SIZE):
                batch = test_constraints[i:i + CHUNK_SIZE]
                psycopg2.extras.execute_values(cur, """
                    INSERT INTO oval_test_constraints_cache
                        (rhel_version, test_ref, package, op, evr, last_checked_at)
                    VALUES %s
                    ON CONFLICT (rhel_version, test_ref, package) DO UPDATE SET
                        op = EXCLUDED.op, evr = EXCLUDED.evr,
                        last_checked_at = EXCLUDED.last_checked_at
                """, [(rhel_ver, tc[0], tc[1], tc[2], tc[3], now) for tc in batch])

        conn.commit()
        total_defs += len(definitions)
        total_constraints += len(test_constraints)
        log.info("RHEL %d: upserted %d definitions, %d test constraints in %.1fs",
                 rhel_ver, len(definitions), len(test_constraints), time.time() - t0)

        del raw, root  # free memory before next version

    log.info("=== Red Hat OVAL import complete: %d definitions, %d constraints ===",
             total_defs, total_constraints)
    return total_defs + total_constraints


# ===========================================================================
# Phase 2: Export PG → SQLite → gzip → MinIO
# ===========================================================================

def export_pg_to_sqlite(conn, sqlite_path: str, summary: dict):
    """Export PG enrichment cache tables into a SQLite DB matching the Rust
    scanner's query schema (zstd-compressed payloads for NVD/OSV)."""

    log.info("=== SQLite export starting → %s ===", sqlite_path)
    started = time.time()

    if os.path.exists(sqlite_path):
        os.remove(sqlite_path)

    sconn = sqlite3.connect(sqlite_path)
    sconn.executescript(SQLITE_SCHEMA)

    # --- NVD (two-pass: sample for dict training, then compress with dict) ---
    log.info("SQLite export: NVD CVEs — collecting samples for dictionary training...")
    nvd_samples = []
    with conn.cursor("nvd_sample") as cur:
        cur.itersize = 5000
        cur.execute("SELECT payload FROM nvd_cve_cache LIMIT %s", (DICT_SAMPLE_SIZE,))
        for (payload,) in cur:
            if isinstance(payload, dict):
                cve = payload
            else:
                try:
                    cve = json.loads(str(payload))
                except Exception:
                    continue
            nvd_samples.append(json.dumps(strip_nvd_unused_fields(cve)).encode("utf-8"))

    nvd_dict = train_zstd_dict(nvd_samples)
    nvd_cctx = zstd.ZstdCompressor(level=ZSTD_LEVEL, dict_data=nvd_dict)
    del nvd_samples  # free memory

    log.info("SQLite export: NVD CVEs — compressing with trained dictionary...")
    with conn.cursor("nvd_export") as cur:
        cur.itersize = 5000
        cur.execute("SELECT cve_id, payload, nvd_last_modified FROM nvd_cve_cache")
        batch = []
        nvd_count = 0
        for cve_id, payload, last_mod in cur:
            if isinstance(payload, dict):
                cve = payload
            else:
                try:
                    cve = json.loads(str(payload))
                except Exception:
                    continue
            stripped = strip_nvd_unused_fields(cve)
            payload_json = json.dumps(stripped)
            compressed = zstd_compress(payload_json.encode("utf-8"), cctx=nvd_cctx)
            last_mod_str = str(last_mod) if last_mod else ""
            batch.append((cve_id, compressed, last_mod_str))
            if len(batch) >= CHUNK_SIZE:
                sconn.executemany(
                    "INSERT OR REPLACE INTO nvd_cves (cve_id, payload, last_modified) VALUES (?, ?, ?)",
                    batch)
                nvd_count += len(batch)
                batch = []
        if batch:
            sconn.executemany(
                "INSERT OR REPLACE INTO nvd_cves (cve_id, payload, last_modified) VALUES (?, ?, ?)",
                batch)
            nvd_count += len(batch)
        sconn.commit()

    # Store NVD dictionary in metadata for scanner decompression
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('nvd_zstd_dict', ?)",
                  (sqlite3.Binary(nvd_dict.as_bytes()),))
    sconn.commit()
    del nvd_cctx
    log.info("SQLite export: %d NVD CVEs (dict-compressed)", nvd_count)

    # --- OSV (two-pass: sample for dict training, then compress with dict) ---
    log.info("SQLite export: OSV vulns — collecting samples for dictionary training...")
    osv_samples = []
    with conn.cursor("osv_sample") as cur:
        cur.itersize = 5000
        cur.execute("SELECT payload FROM osv_vuln_cache LIMIT %s", (DICT_SAMPLE_SIZE,))
        for (payload,) in cur:
            if isinstance(payload, dict):
                vuln = payload
            else:
                try:
                    vuln = json.loads(str(payload))
                except Exception:
                    continue
            osv_samples.append(json.dumps(strip_osv_unused_fields(vuln)).encode("utf-8"))

    osv_dict = train_zstd_dict(osv_samples)
    osv_cctx = zstd.ZstdCompressor(level=ZSTD_LEVEL, dict_data=osv_dict)
    del osv_samples

    log.info("SQLite export: OSV vulns — compressing with trained dictionary...")
    with conn.cursor("osv_export") as cur:
        cur.itersize = 5000
        cur.execute("SELECT vuln_id, payload, osv_last_modified FROM osv_vuln_cache")
        batch_payloads = []
        batch_vulns = []
        batch_packages = []
        osv_count = 0
        for vuln_id, payload, last_mod in cur:
            if isinstance(payload, dict):
                vuln = payload
            else:
                try:
                    vuln = json.loads(str(payload))
                except Exception:
                    continue

            stripped = strip_osv_unused_fields(vuln)
            payload_bytes = json.dumps(stripped).encode("utf-8")
            compressed = zstd_compress(payload_bytes, cctx=osv_cctx)
            modified = vuln.get("modified", "")

            batch_payloads.append((vuln_id, compressed))

            # Extract affected packages
            for aff in vuln.get("affected", []):
                pkg = aff.get("package", {})
                eco = pkg.get("ecosystem", "")
                name = pkg.get("name", "")
                if eco and name:
                    batch_packages.append((eco, name))
                    batch_vulns.append((vuln_id, eco, name, modified))

            if len(batch_payloads) >= CHUNK_SIZE:
                sconn.executemany(
                    "INSERT OR IGNORE INTO osv_payloads (id, payload) VALUES (?, ?)",
                    batch_payloads)
                sconn.executemany(
                    "INSERT OR IGNORE INTO osv_packages (ecosystem, name) VALUES (?, ?)",
                    batch_packages)
                sconn.executemany(
                    "INSERT OR REPLACE INTO osv_vulns (id, ecosystem, name, modified) VALUES (?, ?, ?, ?)",
                    batch_vulns)
                osv_count += len(batch_payloads)
                batch_payloads = []
                batch_vulns = []
                batch_packages = []

        if batch_payloads:
            sconn.executemany(
                "INSERT OR IGNORE INTO osv_payloads (id, payload) VALUES (?, ?)",
                batch_payloads)
            sconn.executemany(
                "INSERT OR IGNORE INTO osv_packages (ecosystem, name) VALUES (?, ?)",
                batch_packages)
            sconn.executemany(
                "INSERT OR REPLACE INTO osv_vulns (id, ecosystem, name, modified) VALUES (?, ?, ?, ?)",
                batch_vulns)
            osv_count += len(batch_payloads)
        sconn.commit()

    # Store OSV dictionary in metadata for scanner decompression
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('osv_zstd_dict', ?)",
                  (sqlite3.Binary(osv_dict.as_bytes()),))
    sconn.commit()
    del osv_cctx
    log.info("SQLite export: %d OSV vulns (dict-compressed)", osv_count)

    # --- EPSS ---
    log.info("SQLite export: EPSS scores...")
    with conn.cursor("epss_export") as cur:
        cur.itersize = 10000
        cur.execute("SELECT cve_id, score, percentile FROM epss_scores_cache")
        batch = []
        epss_count = 0
        for cve_id, score, percentile in cur:
            batch.append((cve_id, float(score), float(percentile)))
            if len(batch) >= CHUNK_SIZE:
                sconn.executemany(
                    "INSERT OR REPLACE INTO epss_scores (cve_id, score, percentile) VALUES (?, ?, ?)",
                    batch)
                epss_count += len(batch)
                batch = []
        if batch:
            sconn.executemany(
                "INSERT OR REPLACE INTO epss_scores (cve_id, score, percentile) VALUES (?, ?, ?)",
                batch)
            epss_count += len(batch)
        sconn.commit()
    log.info("SQLite export: %d EPSS scores", epss_count)

    # --- KEV ---
    log.info("SQLite export: KEV entries...")
    with conn.cursor() as cur:
        cur.execute("SELECT cve_id FROM kev_entries_cache")
        kev_rows = [(r[0],) for r in cur]
    sconn.executemany("INSERT OR IGNORE INTO kev_entries (cve_id) VALUES (?)", kev_rows)
    sconn.commit()
    log.info("SQLite export: %d KEV entries", len(kev_rows))

    # --- Debian ---
    log.info("SQLite export: Debian tracker...")
    with conn.cursor("debian_export") as cur:
        cur.itersize = 10000
        cur.execute("SELECT cve_id, package, release, status, urgency, fixed_version FROM debian_tracker_cache")
        batch = []
        deb_count = 0
        for row in cur:
            batch.append(row)
            if len(batch) >= CHUNK_SIZE:
                sconn.executemany(
                    "INSERT OR REPLACE INTO debian_tracker (cve_id, package, release, status, urgency, fixed_version) VALUES (?, ?, ?, ?, ?, ?)",
                    batch)
                deb_count += len(batch)
                batch = []
        if batch:
            sconn.executemany(
                "INSERT OR REPLACE INTO debian_tracker (cve_id, package, release, status, urgency, fixed_version) VALUES (?, ?, ?, ?, ?, ?)",
                batch)
            deb_count += len(batch)
        sconn.commit()
    log.info("SQLite export: %d Debian entries", deb_count)

    # --- Ubuntu (filter out DNE/not-affected/ignored — only keep actionable statuses) ---
    log.info("SQLite export: Ubuntu USN (actionable statuses only)...")
    with conn.cursor("ubuntu_export") as cur:
        cur.itersize = 10000
        cur.execute("""SELECT cve_id, package, release, status, priority
                       FROM ubuntu_usn_cache
                       WHERE status NOT IN ('DNE', 'not-affected', 'ignored')""")
        batch = []
        ubuntu_count = 0
        since_commit = 0
        for row in cur:
            batch.append(row)
            if len(batch) >= CHUNK_SIZE:
                sconn.executemany(
                    "INSERT OR REPLACE INTO ubuntu_usn (cve_id, package, release, status, priority) VALUES (?, ?, ?, ?, ?)",
                    batch)
                ubuntu_count += len(batch)
                since_commit += len(batch)
                batch = []
                if since_commit >= 50000:
                    sconn.commit()
                    since_commit = 0
        if batch:
            sconn.executemany(
                "INSERT OR REPLACE INTO ubuntu_usn (cve_id, package, release, status, priority) VALUES (?, ?, ?, ?, ?)",
                batch)
            ubuntu_count += len(batch)
        sconn.commit()
    log.info("SQLite export: %d Ubuntu entries", ubuntu_count)

    # --- Alpine ---
    log.info("SQLite export: Alpine SecDB...")
    with conn.cursor("alpine_export") as cur:
        cur.itersize = 10000
        cur.execute("SELECT cve_id, package, branch, repo, fixed_version FROM alpine_secdb_cache")
        batch = []
        alpine_count = 0
        for row in cur:
            batch.append(row)
            if len(batch) >= CHUNK_SIZE:
                sconn.executemany(
                    "INSERT OR REPLACE INTO alpine_secdb (cve_id, package, branch, repo, fixed_version) VALUES (?, ?, ?, ?, ?)",
                    batch)
                alpine_count += len(batch)
                batch = []
        if batch:
            sconn.executemany(
                "INSERT OR REPLACE INTO alpine_secdb (cve_id, package, branch, repo, fixed_version) VALUES (?, ?, ?, ?, ?)",
                batch)
            alpine_count += len(batch)
        sconn.commit()
    log.info("SQLite export: %d Alpine entries", alpine_count)

    # --- Metadata ---
    build_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('build_date', ?)", (build_date,))
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', '2')")
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('dict_compression', '1')")
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('nvd_count', ?)", (str(nvd_count),))
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('osv_count', ?)", (str(osv_count),))
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('epss_count', ?)", (str(epss_count),))
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('kev_count', ?)", (str(len(kev_rows)),))
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('debian_count', ?)", (str(deb_count),))
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('ubuntu_count', ?)", (str(ubuntu_count),))
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('alpine_count', ?)", (str(alpine_count),))
    sconn.commit()

    # Optimize
    sconn.execute("PRAGMA optimize")
    sconn.execute("PRAGMA journal_mode=WAL")
    sconn.close()

    elapsed = time.time() - started
    size_mb = os.path.getsize(sqlite_path) / (1024 * 1024)
    log.info("SQLite export done: %.1f MB in %.0fs (nvd=%d osv=%d epss=%d kev=%d debian=%d ubuntu=%d alpine=%d)",
             size_mb, elapsed, nvd_count, osv_count, epss_count, len(kev_rows),
             deb_count, ubuntu_count, alpine_count)


def gzip_file(src_path: str, dst_path: str):
    """Gzip compress a file."""
    with open(src_path, "rb") as f_in:
        with gzip.open(dst_path, "wb", compresslevel=6) as f_out:
            while True:
                chunk = f_in.read(1024 * 1024)
                if not chunk:
                    break
                f_out.write(chunk)
    size_mb = os.path.getsize(dst_path) / (1024 * 1024)
    log.info("Gzipped: %s → %s (%.1f MB)", src_path, dst_path, size_mb)


def upload_to_minio(local_path: str, object_name: str):
    """Upload a file to MinIO using the minio SDK."""
    from minio import Minio

    endpoint = os.environ.get("S3_ENDPOINT", "minio.storage.svc:9000")
    access_key = os.environ.get("S3_ACCESS_KEY", "")
    secret_key = os.environ.get("S3_SECRET_KEY", "")
    use_ssl = os.environ.get("S3_USE_SSL", "false").lower() == "true"
    bucket = os.environ.get("VULNDB_BUCKET", "vulndb")

    if not access_key or not secret_key:
        log.error("S3_ACCESS_KEY / S3_SECRET_KEY not set, skipping MinIO upload")
        return False

    client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=use_ssl)

    # Ensure bucket exists
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)
        log.info("Created MinIO bucket: %s", bucket)

    file_size = os.path.getsize(local_path)
    client.fput_object(bucket, object_name, local_path)
    log.info("Uploaded to MinIO: %s/%s (%.1f MB)", bucket, object_name, file_size / (1024 * 1024))

    # Prune old DB files (keep last 14 days)
    cutoff = datetime.now(timezone.utc) - timedelta(days=14)
    try:
        for obj in client.list_objects(bucket, prefix="scanrook-db-"):
            if obj.last_modified and obj.last_modified < cutoff:
                client.remove_object(bucket, obj.object_name)
                log.info("Pruned old DB: %s", obj.object_name)
    except Exception as e:
        log.warning("Failed to prune old DBs: %s", e)

    return True


# ===========================================================================
# Main
# ===========================================================================

def _run_source(db_url, session, source_name, env_var, import_fn):
    """Run a single source import with its own PG connection.

    Returns (result, updated_bool). On failure, returns (error_string, False)
    and logs the error so subsequent sources are not affected.
    """
    if not enabled(env_var):
        return None, False

    conn = pg_connect(db_url)
    try:
        if not source_is_stale(conn, source_name):
            conn.close()
            return "fresh", False
        result = import_fn(conn, session)
        conn.close()
        return result, True
    except Exception as e:
        log.error("%s import FAILED: %s", source_name.upper(), e, exc_info=True)
        try:
            conn.close()
        except Exception:
            pass
        return f"FAILED: {e}", False


def main():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        log.error("DATABASE_URL not set")
        sys.exit(1)

    log.info("Connecting to PostgreSQL...")
    conn = pg_connect(db_url)
    ensure_pg_tables(conn)
    conn.close()

    session = get_session()
    summary = {}
    any_updated = False

    # --- Source imports: each gets its own connection for resilience ---
    sources = [
        ("nvd",     "IMPORT_NVD",     import_nvd),
        ("osv",     "IMPORT_OSV",     import_osv),
        ("epss",    "IMPORT_EPSS",    import_epss),
        ("kev",     "IMPORT_KEV",     import_kev),
        ("debian",  "IMPORT_DEBIAN",  import_debian),
        ("ubuntu",  "IMPORT_UBUNTU",  import_ubuntu),
        ("alpine",  "IMPORT_ALPINE",  import_alpine),
        ("oval",    "IMPORT_OVAL",    import_redhat_oval),
    ]

    for source_name, env_var, import_fn in sources:
        result, updated = _run_source(db_url, session, source_name, env_var, import_fn)
        if result is not None:
            summary[source_name] = result
            if updated:
                any_updated = True

    log.info("=== PG import phase complete === %s", json.dumps(summary, default=str))

    # --- SQLite export + MinIO upload ---
    skip_export = os.environ.get("SKIP_SQLITE_EXPORT", "0") == "1"
    do_export = False

    if skip_export:
        log.info("SQLite export skipped (SKIP_SQLITE_EXPORT=1)")
    elif any_updated or force_refresh():
        do_export = True
    else:
        # No sources updated — still export if today's file doesn't exist in MinIO
        from minio import Minio
        endpoint = os.environ.get("S3_ENDPOINT", "minio.storage.svc:9000")
        access_key = os.environ.get("S3_ACCESS_KEY", "")
        secret_key = os.environ.get("S3_SECRET_KEY", "")
        use_ssl = os.environ.get("S3_USE_SSL", "false").lower() == "true"
        bucket = os.environ.get("VULNDB_BUCKET", "vulndb")
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        today_obj = f"scanrook-db-{date_str}.sqlite"
        try:
            mc = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=use_ssl)
            mc.stat_object(bucket, today_obj)
            log.info("No sources updated and %s/%s already exists, skipping SQLite rebuild",
                     bucket, today_obj)
        except Exception:
            log.info("No sources updated but %s/%s missing — exporting anyway", bucket, today_obj)
            do_export = True

    if do_export:
        conn = pg_connect(db_url)
        try:
            # Use SCRATCH_DIR if set (emptyDir volume in K8s), else system tmp
            scratch = os.environ.get("SCRATCH_DIR", None)
            with tempfile.TemporaryDirectory(dir=scratch) as tmpdir:
                date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                sqlite_name = f"scanrook-db-{date_str}.sqlite"
                sqlite_path = os.path.join(tmpdir, sqlite_name)

                export_pg_to_sqlite(conn, sqlite_path, summary)
                # Upload raw .sqlite — payloads inside are already zstd-compressed,
                # so outer compression (gzip/zstd) is ineffective double-compression
                upload_to_minio(sqlite_path, sqlite_name)
        finally:
            conn.close()

    log.info("=== vulndb-pg-import complete ===")


if __name__ == "__main__":
    main()

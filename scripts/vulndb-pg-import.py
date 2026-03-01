#!/usr/bin/env python3
"""
vulndb-pg-import.py — Bulk-import vulnerability data into PostgreSQL and export
a compressed SQLite DB to MinIO for CLI users.

Pipeline:
  1. Check revalidation schedule per source (skip sources that are fresh enough)
  2. Download fresh data, diff against PG, upsert only new/changed rows
  3. Export PG enrichment cache → SQLite DB (matching Rust scanner schema)
  4. Compress SQLite with gzip
  5. Upload to MinIO for CLI 'scanrook db fetch' users

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


def get_session() -> requests.Session:
    s = requests.Session()
    s.headers["User-Agent"] = "scanrook-vulndb-import/1.0"
    api_key = os.environ.get("NVD_API_KEY")
    if api_key:
        s.headers["apiKey"] = api_key
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


def zstd_compress(data: bytes) -> bytes:
    """Compress with zstd level 3 — matches Rust scanner's compress_json()."""
    cctx = zstd.ZstdCompressor(level=3)
    return cctx.compress(data)


def strip_osv_unused_fields(vuln: dict) -> dict:
    """Strip bulky unused fields from OSV vulns to reduce payload size ~50-70%.
    Matches the Rust scanner's strip_osv_unused_fields()."""
    keep_keys = {"id", "summary", "details", "aliases", "severity",
                 "affected", "references", "modified", "published",
                 "database_specific", "schema_version"}
    return {k: v for k, v in vuln.items() if k in keep_keys}


def nvd_request_with_retry(session, url, max_attempts=5):
    """Make an NVD API request with retry + backoff for rate limits."""
    for attempt in range(max_attempts):
        try:
            resp = session.get(url, timeout=120)
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
    limit = 100

    while True:
        url = f"{UBUNTU_CVE_BASE}?limit={limit}&offset={offset}"
        try:
            resp = session.get(url, timeout=120)
            if resp.status_code in (422, 404, 500):
                log.warning("Ubuntu CVE API returned %d at offset %d, stopping", resp.status_code, offset)
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

    # --- NVD ---
    log.info("SQLite export: NVD CVEs...")
    with conn.cursor("nvd_export") as cur:
        cur.itersize = 5000
        cur.execute("SELECT cve_id, payload, nvd_last_modified FROM nvd_cve_cache")
        batch = []
        nvd_count = 0
        for cve_id, payload, last_mod in cur:
            payload_json = json.dumps(payload) if isinstance(payload, dict) else str(payload)
            compressed = zstd_compress(payload_json.encode("utf-8"))
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
    log.info("SQLite export: %d NVD CVEs", nvd_count)

    # --- OSV ---
    log.info("SQLite export: OSV vulns...")
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
            compressed = zstd_compress(payload_bytes)
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
    log.info("SQLite export: %d OSV vulns", osv_count)

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

    # --- Ubuntu ---
    log.info("SQLite export: Ubuntu USN...")
    with conn.cursor("ubuntu_export") as cur:
        cur.itersize = 10000
        cur.execute("SELECT cve_id, package, release, status, priority FROM ubuntu_usn_cache")
        batch = []
        ubuntu_count = 0
        for row in cur:
            batch.append(row)
            if len(batch) >= CHUNK_SIZE:
                sconn.executemany(
                    "INSERT OR REPLACE INTO ubuntu_usn (cve_id, package, release, status, priority) VALUES (?, ?, ?, ?, ?)",
                    batch)
                ubuntu_count += len(batch)
                batch = []
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
    sconn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', '1')")
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

def main():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        log.error("DATABASE_URL not set")
        sys.exit(1)

    log.info("Connecting to PostgreSQL...")
    conn = psycopg2.connect(db_url)
    conn.set_session(autocommit=False)

    ensure_pg_tables(conn)

    session = get_session()
    summary = {}
    any_updated = False

    # --- Source imports with revalidation checks ---

    if enabled("IMPORT_NVD") and source_is_stale(conn, "nvd"):
        summary["nvd"] = import_nvd(conn, session)
        any_updated = True
    elif enabled("IMPORT_NVD"):
        summary["nvd"] = "fresh"

    if enabled("IMPORT_OSV") and source_is_stale(conn, "osv"):
        summary["osv"] = import_osv(conn, session)
        any_updated = True
    elif enabled("IMPORT_OSV"):
        summary["osv"] = "fresh"

    if enabled("IMPORT_EPSS") and source_is_stale(conn, "epss"):
        summary["epss"] = import_epss(conn, session)
        any_updated = True
    elif enabled("IMPORT_EPSS"):
        summary["epss"] = "fresh"

    if enabled("IMPORT_KEV") and source_is_stale(conn, "kev"):
        summary["kev"] = import_kev(conn, session)
        any_updated = True
    elif enabled("IMPORT_KEV"):
        summary["kev"] = "fresh"

    if enabled("IMPORT_DEBIAN") and source_is_stale(conn, "debian"):
        summary["debian"] = import_debian(conn, session)
        any_updated = True
    elif enabled("IMPORT_DEBIAN"):
        summary["debian"] = "fresh"

    if enabled("IMPORT_UBUNTU") and source_is_stale(conn, "ubuntu"):
        summary["ubuntu"] = import_ubuntu(conn, session)
        any_updated = True
    elif enabled("IMPORT_UBUNTU"):
        summary["ubuntu"] = "fresh"

    if enabled("IMPORT_ALPINE") and source_is_stale(conn, "alpine"):
        summary["alpine"] = import_alpine(conn, session)
        any_updated = True
    elif enabled("IMPORT_ALPINE"):
        summary["alpine"] = "fresh"

    log.info("=== PG import phase complete === %s", json.dumps(summary, default=str))

    # --- SQLite export + MinIO upload ---
    if os.environ.get("SKIP_SQLITE_EXPORT", "0") == "1":
        log.info("SQLite export skipped (SKIP_SQLITE_EXPORT=1)")
    elif not any_updated and not force_refresh():
        log.info("No sources updated, skipping SQLite rebuild")
    else:
        with tempfile.TemporaryDirectory() as tmpdir:
            date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            sqlite_name = f"scanrook-db-{date_str}.sqlite"
            sqlite_path = os.path.join(tmpdir, sqlite_name)
            gz_path = sqlite_path + ".gz"

            export_pg_to_sqlite(conn, sqlite_path, summary)
            gzip_file(sqlite_path, gz_path)
            upload_to_minio(gz_path, sqlite_name + ".gz")

    conn.close()
    log.info("=== vulndb-pg-import complete ===")


if __name__ == "__main__":
    main()

# Phase 4: Scanner Hardening - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the scanner v1.8 refactor (phases 3-5), fix DMG scanning to detect .app bundles and all embedded packages, harden all input format handlers against edge cases, add comprehensive test coverage, and release as v2.0.0 with multi-platform binaries, changelog, and install/upgrade script.

</domain>

<decisions>
## Implementation Decisions

### DMG Fix Approach
- Fix extraction AND add macOS .app bundle detection — parse Info.plist for CFBundleVersion, scan embedded frameworks and dylibs
- Report everything detectable: app bundles, frameworks, dylibs, AND any traditional packages (npm node_modules, pip requirements, Homebrew receipts)
- Use pure Rust fallback for DMG extraction on Linux (no 7z dependency) — keep hdiutil as primary on macOS
- Commit a small test DMG fixture to the repo for CI regression testing

### v1.8 Refactor Scope
- Must-haves for this milestone: Phase 3 (RHEL/Rocky consolidation), Phase 4 (multi-format reliability), Phase 5 (test coverage)
- Deferred: Phase 6 (benchmarks) — already covered by ScanRook ROADMAP Phase 7
- RHEL consolidation approach: Claude's discretion — pick based on actual code overlap and risk
- Multi-format reliability: ALL formats equally (containers, ISOs, ZIPs, SBOMs, DMGs, binaries) — every type gets edge case handling, timeout protection, size limits
- Test coverage: Both unit tests (per module) AND integration tests (real fixtures through full pipeline)

### Release Versioning
- Version: v2.0.0 (major bump to signal the completed refactor + DMG fix + hardening)
- CLI binary name: `scanrook` only — drop the deprecated `scanner` alias entirely
- GitHub release includes: multi-platform binaries (Linux amd64/arm64, macOS intel/apple silicon), SHA256 checksums, structured changelog, install/upgrade script
- Install script: curl | sh, auto-detects platform, handles both fresh install and upgrade (detect existing, back up old binary, replace, show version diff)

### Error Handling
- Corrupt/malformed input files: Claude's discretion on fail-fast vs partial results
- Unreachable vulnerability sources: continue without them, note as warning in report (circuit breaker from Phase 2 already handles this)
- Size limits: configurable limits for extracted size and file count (prevent decompression bombs). Default limits, overridable via flags
- Exit codes: Claude's discretion based on what the Go worker currently checks

### Claude's Discretion
- RHEL consolidation approach (full merge vs shared types)
- Error handling policy for corrupt inputs (fail-fast vs partial results vs configurable)
- Exit code semantics (simple 0/1 vs semantic codes)
- Exact size limit defaults
- Pure Rust DMG crate selection

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/archive/dmg.rs` (222 lines): Existing DMG handler with hdiutil/7z extraction — needs pure Rust fallback + .app bundle scanning
- `src/cli/detect.rs`: Auto-detection logic via magic bytes — DMG detected via UDIF "koly" magic at EOF
- `src/vuln/circuit.rs`: Circuit breaker (Phase 2) — already handles source unavailability
- `src/vuln/pg.rs`: PostgreSQL caching & schema — DB-first enrichment pipeline complete
- `.github/workflows/release.yml`: Multi-platform release workflow (Linux/macOS, amd64/arm64) — triggered on tag push
- `Makefile`: Build, install, scan, fmt targets

### Established Patterns
- File type detection: extension fast path → magic bytes fallback → dispatch to handler module
- Report generation: each handler returns `Report` struct with packages, vulnerabilities, metadata
- Progress reporting: `src/progress.rs` — NDJSON events streamed to file, tailed by Go worker
- Enrichment pipeline: packages → OSV batch query (PG cached) → NVD CPE matching → distro-specific feeds → EPSS/KEV

### Integration Points
- Go worker calls scanner binary with `scan <file>` — reads JSON report from stdout or output file
- Worker checks exit code for success/failure
- Worker tails NDJSON progress file for real-time events
- Scanner version checked by worker on startup

</code_context>

<specifics>
## Specific Ideas

- v2.0.0 signals a breaking change from the old "scanner" name to "scanrook" — clean break
- The install script should feel like rustup or nvm — detect platform, download right binary, set up PATH

</specifics>

<deferred>
## Deferred Ideas

- Phase 6 benchmarks (scanner vs Trivy/Grype) — covered by ScanRook ROADMAP Phase 7
- Homebrew tap / crates.io publishing — out of scope per PROJECT.md

</deferred>

---

*Phase: 04-scanner-hardening*
*Context gathered: 2026-03-03*

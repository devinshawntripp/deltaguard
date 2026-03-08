# SBOM Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Full SBOM lifecycle in ScanRook — import, export, diff, policy gates, dedicated UI page, and dependency graph visualization.

**Architecture:** Scanner-centric. All SBOM format parsing, conversion, diff, and policy evaluation lives in the Rust scanner binary. The Go worker orchestrates post-scan SBOM generation as a non-blocking step. The Next.js UI provides a dedicated SBOM section plus integration into job detail pages. Existing API key auth covers all new endpoints.

**Tech Stack:** Rust (scanner CLI), Go (worker orchestration), Next.js 16 / React 19 / Tailwind (UI), PostgreSQL (schema), S3/MinIO (SBOM file storage), react-force-graph-2d (dependency graph), SSE (real-time SBOM status updates).

**Repos:**
- Scanner: `~/Desktop/GitHub/Rust/rust_scanner`
- Worker: `~/Desktop/GitHub/go/rust-scanner-worker`
- UI: `~/Desktop/GitHub/Javascript/deltaguard`

---

## Phase 1: SBOM Export Subcommand (Scanner)

### Task 1.1: Add `sbom export` subcommand definition

**Files:**
- Modify: `rust_scanner/src/main.rs:108-154` (SbomCommands enum)

**Step 1: Add Export variant to SbomCommands enum**

In `src/main.rs`, add a new variant after `Policy` (line ~153):

```rust
/// Export a scan report as a standard SBOM (CycloneDX, SPDX, or Syft JSON)
Export {
    /// Path to the scanner report JSON
    #[arg(long)]
    report: String,
    /// Output SBOM format
    #[arg(long, value_enum)]
    sbom_format: SbomExportFormat,
    /// Output file path
    #[arg(long)]
    out: Option<String>,
},
```

Add the enum before `SbomCommands`:

```rust
#[derive(Clone, Debug, ValueEnum)]
pub(crate) enum SbomExportFormat {
    Cyclonedx,
    Spdx,
    Syft,
}
```

**Step 2: Commit**

```bash
git add src/main.rs
git commit -m "feat(sbom): add export subcommand definition to CLI"
```

---

### Task 1.2: Implement SBOM export logic

**Files:**
- Modify: `rust_scanner/src/sbom.rs` (add export functions after existing code)

**Step 1: Write tests for export conversion**

Add tests at the bottom of `src/sbom.rs` (in the `#[cfg(test)]` module):

```rust
#[test]
fn test_export_cyclonedx_basic() {
    let report_json = serde_json::json!({
        "scanner": {"name": "scanrook", "version": "1.13.0"},
        "target": {"type": "container", "source": "nginx.tar"},
        "scan_status": "complete",
        "inventory_status": "complete",
        "findings": [],
        "files": [],
        "summary": {"total_findings": 0, "critical": 0, "high": 0, "medium": 0, "low": 0},
    });
    let result = export_report_as_sbom(&report_json, "cyclonedx").unwrap();
    assert_eq!(result["bomFormat"], "CycloneDX");
    assert_eq!(result["specVersion"], "1.5");
    assert!(result["components"].is_array());
}

#[test]
fn test_export_spdx_basic() {
    let report_json = serde_json::json!({
        "scanner": {"name": "scanrook", "version": "1.13.0"},
        "target": {"type": "container", "source": "nginx.tar"},
        "scan_status": "complete",
        "inventory_status": "complete",
        "findings": [],
        "files": [],
        "summary": {"total_findings": 0, "critical": 0, "high": 0, "medium": 0, "low": 0},
    });
    let result = export_report_as_sbom(&report_json, "spdx").unwrap();
    assert!(result["spdxVersion"].as_str().unwrap().starts_with("SPDX-"));
    assert!(result["packages"].is_array());
}

#[test]
fn test_export_syft_basic() {
    let report_json = serde_json::json!({
        "scanner": {"name": "scanrook", "version": "1.13.0"},
        "target": {"type": "container", "source": "nginx.tar"},
        "scan_status": "complete",
        "inventory_status": "complete",
        "findings": [],
        "files": [],
        "summary": {"total_findings": 0, "critical": 0, "high": 0, "medium": 0, "low": 0},
    });
    let result = export_report_as_sbom(&report_json, "syft").unwrap();
    assert!(result["artifacts"].is_array());
}

#[test]
fn test_export_with_packages() {
    let report_json = serde_json::json!({
        "scanner": {"name": "scanrook", "version": "1.13.0"},
        "target": {"type": "container", "source": "nginx.tar"},
        "scan_status": "complete",
        "inventory_status": "complete",
        "findings": [{
            "id": "CVE-2023-0001",
            "severity": "high",
            "package": {"name": "openssl", "ecosystem": "deb", "version": "3.0.7"},
            "description": "test vuln"
        }],
        "files": [],
        "summary": {"total_findings": 1, "critical": 0, "high": 1, "medium": 0, "low": 0},
    });
    let result = export_report_as_sbom(&report_json, "cyclonedx").unwrap();
    let components = result["components"].as_array().unwrap();
    assert_eq!(components.len(), 1);
    assert_eq!(components[0]["name"], "openssl");
    assert_eq!(components[0]["version"], "3.0.7");
    // Should have PURL
    assert!(components[0]["purl"].as_str().unwrap().starts_with("pkg:deb/"));
}
```

**Step 2: Run tests to verify they fail**

```bash
cd ~/Desktop/GitHub/Rust/rust_scanner
cargo test test_export -- --nocapture
```

Expected: compilation error — `export_report_as_sbom` not found.

**Step 3: Implement export_report_as_sbom**

Add to `src/sbom.rs` before the test module:

```rust
use chrono::Utc;

/// Convert a scanner report JSON to a standard SBOM format.
/// Extracts unique packages from findings and builds the target format.
pub fn export_report_as_sbom(
    report: &serde_json::Value,
    format: &str,
) -> anyhow::Result<serde_json::Value> {
    // Extract unique packages from findings
    let mut seen = std::collections::HashSet::new();
    let mut packages: Vec<serde_json::Value> = Vec::new();

    if let Some(findings) = report["findings"].as_array() {
        for f in findings {
            if let Some(pkg) = f.get("package") {
                let name = pkg["name"].as_str().unwrap_or_default();
                let eco = pkg["ecosystem"].as_str().unwrap_or_default();
                let ver = pkg["version"].as_str().unwrap_or_default();
                let key = format!("{}:{}:{}", eco, name, ver);
                if name.is_empty() || !seen.insert(key) {
                    continue;
                }
                packages.push(serde_json::json!({
                    "name": name,
                    "ecosystem": eco,
                    "version": ver,
                }));
            }
        }
    }

    let target_name = report["target"]["source"]
        .as_str()
        .unwrap_or("unknown");
    let scanner_version = report["scanner"]["version"]
        .as_str()
        .unwrap_or("0.0.0");
    let timestamp = Utc::now().to_rfc3339();

    match format {
        "cyclonedx" => export_cyclonedx(&packages, target_name, scanner_version, &timestamp),
        "spdx" => export_spdx(&packages, target_name, scanner_version, &timestamp),
        "syft" => export_syft(&packages, target_name, scanner_version, &timestamp),
        _ => anyhow::bail!("unsupported SBOM export format: {}", format),
    }
}

fn ecosystem_to_purl_type(eco: &str) -> &str {
    match eco {
        "npm" | "node" => "npm",
        "pypi" | "pip" | "python" => "pypi",
        "cargo" | "rust" | "crates.io" => "cargo",
        "go" | "golang" => "golang",
        "gem" | "ruby" | "rubygems" => "gem",
        "nuget" | "dotnet" => "nuget",
        "maven" | "java" => "maven",
        "deb" | "debian" => "deb",
        "rpm" | "redhat" | "centos" | "fedora" => "rpm",
        "apk" | "alpine" => "apk",
        "composer" | "php" => "composer",
        "hex" | "elixir" | "erlang" => "hex",
        "swift" | "cocoapods" => "swift",
        other => other,
    }
}

fn build_purl(eco: &str, name: &str, version: &str) -> String {
    let purl_type = ecosystem_to_purl_type(eco);
    if version.is_empty() {
        format!("pkg:{}/{}", purl_type, name)
    } else {
        format!("pkg:{}/{}@{}", purl_type, name, version)
    }
}

fn export_cyclonedx(
    packages: &[serde_json::Value],
    target_name: &str,
    scanner_version: &str,
    timestamp: &str,
) -> anyhow::Result<serde_json::Value> {
    let components: Vec<serde_json::Value> = packages.iter().map(|p| {
        let name = p["name"].as_str().unwrap_or_default();
        let eco = p["ecosystem"].as_str().unwrap_or_default();
        let ver = p["version"].as_str().unwrap_or_default();
        serde_json::json!({
            "type": "library",
            "name": name,
            "version": ver,
            "purl": build_purl(eco, name, ver),
            "bom-ref": build_purl(eco, name, ver),
        })
    }).collect();

    Ok(serde_json::json!({
        "bomFormat": "CycloneDX",
        "specVersion": "1.5",
        "version": 1,
        "metadata": {
            "timestamp": timestamp,
            "tools": [{
                "vendor": "ScanRook",
                "name": "scanrook",
                "version": scanner_version,
            }],
            "component": {
                "type": "application",
                "name": target_name,
            }
        },
        "components": components,
        "dependencies": [],
    }))
}

fn export_spdx(
    packages: &[serde_json::Value],
    target_name: &str,
    scanner_version: &str,
    timestamp: &str,
) -> anyhow::Result<serde_json::Value> {
    let spdx_packages: Vec<serde_json::Value> = packages.iter().enumerate().map(|(i, p)| {
        let name = p["name"].as_str().unwrap_or_default();
        let eco = p["ecosystem"].as_str().unwrap_or_default();
        let ver = p["version"].as_str().unwrap_or_default();
        serde_json::json!({
            "SPDXID": format!("SPDXRef-Package-{}", i),
            "name": name,
            "versionInfo": ver,
            "downloadLocation": "NOASSERTION",
            "filesAnalyzed": false,
            "externalRefs": [{
                "referenceCategory": "PACKAGE-MANAGER",
                "referenceType": "purl",
                "referenceLocator": build_purl(eco, name, ver),
            }],
        })
    }).collect();

    Ok(serde_json::json!({
        "spdxVersion": "SPDX-2.3",
        "dataLicense": "CC0-1.0",
        "SPDXID": "SPDXRef-DOCUMENT",
        "name": target_name,
        "documentNamespace": format!("https://scanrook.io/spdx/{}/{}", target_name, timestamp),
        "creationInfo": {
            "created": timestamp,
            "creators": [format!("Tool: scanrook-{}", scanner_version)],
        },
        "packages": spdx_packages,
    }))
}

fn export_syft(
    packages: &[serde_json::Value],
    target_name: &str,
    _scanner_version: &str,
    _timestamp: &str,
) -> anyhow::Result<serde_json::Value> {
    let artifacts: Vec<serde_json::Value> = packages.iter().map(|p| {
        let name = p["name"].as_str().unwrap_or_default();
        let eco = p["ecosystem"].as_str().unwrap_or_default();
        let ver = p["version"].as_str().unwrap_or_default();
        serde_json::json!({
            "name": name,
            "version": ver,
            "type": eco,
            "purl": build_purl(eco, name, ver),
            "language": "",
            "locations": [],
            "metadata": null,
        })
    }).collect();

    Ok(serde_json::json!({
        "artifacts": artifacts,
        "source": {
            "type": "image",
            "target": target_name,
        },
        "schema": {
            "version": "16.0.0",
            "url": "https://raw.githubusercontent.com/anchore/syft/main/schema/json/schema-16.0.0.json",
        },
    }))
}
```

**Step 4: Run tests to verify they pass**

```bash
cargo test test_export -- --nocapture
```

Expected: all 4 tests pass.

**Step 5: Commit**

```bash
git add src/sbom.rs
git commit -m "feat(sbom): implement export_report_as_sbom for CycloneDX, SPDX, Syft"
```

---

### Task 1.3: Wire up export subcommand handler

**Files:**
- Modify: `rust_scanner/src/cli/sbom_cmd.rs:11-148` (run_sbom function)

**Step 1: Add Export match arm**

After the `SbomCommands::Policy` match arm (line ~147), add:

```rust
SbomCommands::Export { report, sbom_format, out } => {
    let report_data = std::fs::read_to_string(&report)
        .with_context(|| format!("failed to read report: {}", report))?;
    let report_json: serde_json::Value = serde_json::from_str(&report_data)
        .with_context(|| "failed to parse report JSON")?;

    let format_str = match sbom_format {
        SbomExportFormat::Cyclonedx => "cyclonedx",
        SbomExportFormat::Spdx => "spdx",
        SbomExportFormat::Syft => "syft",
    };

    let sbom = crate::sbom::export_report_as_sbom(&report_json, format_str)?;
    let output = serde_json::to_string_pretty(&sbom)?;

    if let Some(out_path) = out {
        std::fs::write(&out_path, &output)?;
        eprintln!("SBOM ({}) written to {}", format_str, out_path);
    } else {
        println!("{}", output);
    }
}
```

Note: the `run_sbom` function signature may need updating if it currently returns `()` — wrap the match arms so the Export arm can use `?` (anyhow::Result). Check and adjust accordingly.

**Step 2: Build and test CLI**

```bash
cargo build --release
# Create a test report file first, then:
./target/release/scanrook sbom export --report test-report.json --sbom-format cyclonedx
```

**Step 3: Commit**

```bash
git add src/cli/sbom_cmd.rs src/main.rs
git commit -m "feat(sbom): wire up sbom export CLI handler"
```

---

### Task 1.4: Bump scanner version and tag release

**Files:**
- Modify: `rust_scanner/Cargo.toml:3` (version)

**Step 1: Bump version to 1.14.0**

Change line 3 from `version = "1.13.0"` to `version = "1.14.0"`.

**Step 2: Build final binary**

```bash
cargo build --release
```

**Step 3: Commit and tag**

```bash
git add Cargo.toml
git commit -m "chore: bump scanner version to v1.14.0 (SBOM export)"
git tag v1.14.0
```

---

## Phase 2: Worker SBOM Dispatch & Post-Scan Export

### Task 2.1: Add SBOM file detection in worker

**Files:**
- Create: `rust-scanner-worker/internal/worker/sbom.go`

**Step 1: Write detection function**

```go
package worker

import (
	"encoding/json"
	"io"
	"os"
)

// isSbomFile checks if a file is an SBOM (CycloneDX, SPDX, or Syft JSON)
// by reading the first 4KB and looking for format-specific keys.
func isSbomFile(path string) bool {
	f, err := os.Open(path)
	if err != nil {
		return false
	}
	defer f.Close()

	// Read first 4KB
	buf := make([]byte, 4096)
	n, err := f.Read(buf)
	if err != nil && err != io.EOF {
		return false
	}
	buf = buf[:n]

	// Try to parse as JSON object
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(buf, &obj); err != nil {
		// Try with closing brace appended (truncated read)
		if err := json.Unmarshal(append(buf, '}'), &obj); err != nil {
			return false
		}
	}

	// CycloneDX: has "bomFormat"
	if _, ok := obj["bomFormat"]; ok {
		return true
	}
	// SPDX: has "spdxVersion"
	if _, ok := obj["spdxVersion"]; ok {
		return true
	}
	// Syft: has "artifacts"
	if _, ok := obj["artifacts"]; ok {
		return true
	}
	return false
}
```

**Step 2: Write test**

Create `rust-scanner-worker/internal/worker/sbom_test.go`:

```go
package worker

import (
	"os"
	"path/filepath"
	"testing"
)

func TestIsSbomFile_CycloneDX(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "test.cdx.json")
	os.WriteFile(p, []byte(`{"bomFormat":"CycloneDX","specVersion":"1.5","components":[]}`), 0644)
	if !isSbomFile(p) {
		t.Fatal("expected CycloneDX to be detected as SBOM")
	}
}

func TestIsSbomFile_SPDX(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "test.spdx.json")
	os.WriteFile(p, []byte(`{"spdxVersion":"SPDX-2.3","packages":[]}`), 0644)
	if !isSbomFile(p) {
		t.Fatal("expected SPDX to be detected as SBOM")
	}
}

func TestIsSbomFile_Syft(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "test.syft.json")
	os.WriteFile(p, []byte(`{"artifacts":[],"source":{"type":"image"}}`), 0644)
	if !isSbomFile(p) {
		t.Fatal("expected Syft to be detected as SBOM")
	}
}

func TestIsSbomFile_NotSbom(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "regular.tar")
	os.WriteFile(p, []byte{0x1f, 0x8b, 0x08}, 0644) // gzip header
	if isSbomFile(p) {
		t.Fatal("expected non-SBOM to not be detected")
	}
}
```

**Step 3: Run tests**

```bash
cd ~/Desktop/GitHub/go/rust-scanner-worker
go test ./internal/worker/ -run TestIsSbomFile -v
```

**Step 4: Commit**

```bash
git add internal/worker/sbom.go internal/worker/sbom_test.go
git commit -m "feat(sbom): add SBOM file format detection"
```

---

### Task 2.2: Route SBOM files to `sbom import` subcommand

**Files:**
- Modify: `rust-scanner-worker/internal/worker/runner.go:201-209` (args construction)

**Step 1: Add SBOM-aware command construction**

In `runner.go`, replace the args construction block (lines ~201-209) with:

```go
var args []string
if isSbomFile(inputPath) {
    args = []string{
        "--progress", "--progress-file", progressPath,
        "sbom", "import", "--file", inputPath,
        "--format", j.Format, "--out", reportPath,
        "--mode", j.Mode,
    }
    if j.Refs {
        args = append(args, "--refs")
    }
    log.Printf("[job=%s] detected SBOM file, using sbom import subcommand", j.ID)
} else {
    args = []string{
        "--progress", "--progress-file", progressPath,
        "scan", "--file", inputPath,
        "--format", j.Format, "--out", reportPath,
    }
    if j.Refs {
        args = append(args, "--refs")
    }
    args = append(args, "--mode", j.Mode)
}
```

**Step 2: Run existing tests to verify nothing breaks**

```bash
go test ./internal/worker/ -v
```

**Step 3: Commit**

```bash
git add internal/worker/runner.go
git commit -m "feat(sbom): route SBOM files to sbom import subcommand"
```

---

### Task 2.3: Post-scan SBOM export generation

**Files:**
- Modify: `rust-scanner-worker/internal/worker/runner.go` (after MarkDone, lines ~380-402)
- Modify: `rust-scanner-worker/internal/worker/sbom.go` (add export function)

**Step 1: Add export function to sbom.go**

```go
// generateSbomExports runs `scanrook sbom export` for all three formats
// and uploads the results to S3. This is non-blocking — scan is already marked done.
func (r *Runner) generateSbomExports(ctx context.Context, jobID, reportPath, reportBucket, reportKey string) {
	formats := []struct {
		name string
		ext  string
	}{
		{"cyclonedx", "sbom.cdx.json"},
		{"spdx", "sbom.spdx.json"},
		{"syft", "sbom.syft.json"},
	}

	for _, fmt := range formats {
		outPath := reportPath + "." + fmt.ext
		cmd := exec.CommandContext(ctx, r.cfg.ScannerPath,
			"sbom", "export",
			"--report", reportPath,
			"--sbom-format", fmt.name,
			"--out", outPath,
		)
		cmd.Env = os.Environ()

		if output, err := cmd.CombinedOutput(); err != nil {
			log.Printf("[job=%s] sbom export %s failed: %v: %s", jobID, fmt.name, err, string(output))
			continue
		}

		// Upload to S3: same prefix as report, different filename
		// reportKey is like "reports/<jobID>.json"
		// sbomKey becomes "reports/<jobID>.sbom.cdx.json"
		sbomKey := strings.TrimSuffix(reportKey, ".json") + "." + fmt.ext
		if err := r.s3.UploadFileWithRetry(ctx, reportBucket, sbomKey, outPath, 3, 200*time.Millisecond); err != nil {
			log.Printf("[job=%s] sbom upload %s failed: %v", jobID, fmt.name, err)
			continue
		}

		log.Printf("[job=%s] sbom export %s uploaded to %s/%s", jobID, fmt.name, reportBucket, sbomKey)

		// Clean up temp file
		os.Remove(outPath)
	}
}
```

**Step 2: Call generateSbomExports after MarkDone in runner.go**

After the successful MarkDone call (line ~394), add:

```go
// Non-blocking SBOM export — scan is already marked done
go func() {
    sbomCtx, sbomCancel := context.WithTimeout(context.Background(), 2*time.Minute)
    defer sbomCancel()

    r.generateSbomExports(sbomCtx, j.ID, reportPath, reportBucket, reportKey)

    // Update sbom_status and emit event
    if err := r.db.UpdateSbomStatus(sbomCtx, j.ID, "ready"); err != nil {
        log.Printf("[job=%s] failed to update sbom_status: %v", j.ID, err)
        return
    }
    // Insert scan event for SSE
    if err := r.db.InsertEvent(sbomCtx, j.ID, time.Now(), "sbom_export_complete", "SBOM exports ready for download", 100); err != nil {
        log.Printf("[job=%s] failed to insert sbom event: %v", j.ID, err)
    }
}()
```

**Step 3: Commit**

```bash
git add internal/worker/sbom.go internal/worker/runner.go
git commit -m "feat(sbom): generate 3 SBOM exports after scan completion"
```

---

### Task 2.4: Add sbom_status column and DB functions

**Files:**
- Modify: `rust-scanner-worker/internal/db/db.go` (add UpdateSbomStatus function)
- Modify: `scanrook-ui/src/lib/prisma.ts` (add sbom_status column to schema)

**Step 1: Add DB function in worker**

Add to `rust-scanner-worker/internal/db/db.go`:

```go
// UpdateSbomStatus sets the sbom_status column and emits a pg_notify.
func (d *DB) UpdateSbomStatus(ctx context.Context, jobID, status string) error {
	_, err := d.pool.Exec(ctx,
		`UPDATE scan_jobs SET sbom_status = $1 WHERE id = $2`,
		status, jobID,
	)
	if err != nil {
		return err
	}
	_, err = d.pool.Exec(ctx,
		`SELECT pg_notify('scan_events', $1)`, jobID,
	)
	return err
}
```

**Step 2: Add column to UI schema bootstrap**

In `scanrook-ui/src/lib/prisma.ts`, find the `scan_jobs` CREATE TABLE and add after the existing columns (or add a separate ALTER TABLE in the migration section):

```sql
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS sbom_status TEXT NOT NULL DEFAULT 'pending';
```

Add this line near the other ALTER TABLE statements for scan_jobs.

**Step 3: Commit both repos**

```bash
cd ~/Desktop/GitHub/go/rust-scanner-worker
git add internal/db/db.go
git commit -m "feat(sbom): add UpdateSbomStatus DB function"

cd ~/Desktop/GitHub/Javascript/deltaguard
git add src/lib/prisma.ts
git commit -m "feat(sbom): add sbom_status column to scan_jobs schema"
```

---

## Phase 3: SBOM UI Tab & Download

### Task 3.1: Add SBOM tab to job detail page

**Files:**
- Modify: `scanrook-ui/src/components/JobDetailTabs.tsx:10,26-30` (add tab)

**Step 1: Add "SBOM" tab**

Change the TabId type and TABS array:

```typescript
type TabId = "dashboard" | "findings" | "threat" | "sbom";

const TABS: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "findings", label: "Findings" },
    { id: "threat", label: "Threat" },
    { id: "sbom", label: "SBOM" },
];
```

Add the tab content rendering (after the threat tab section):

```tsx
{activeTab === "sbom" && (
    <SbomTabView jobId={job.id} sbomStatus={job.sbom_status} />
)}
```

**Step 2: Commit**

```bash
git add src/components/JobDetailTabs.tsx
git commit -m "feat(sbom): add SBOM tab to job detail page"
```

---

### Task 3.2: Create SbomTabView component

**Files:**
- Create: `scanrook-ui/src/components/SbomTabView.tsx`

**Step 1: Build the component**

```tsx
"use client";
import { useState, useEffect } from "react";

type SbomTabViewProps = {
    jobId: string;
    sbomStatus: string; // "pending" | "ready" | "failed"
};

type SbomSummary = {
    total_packages: number;
    ecosystems: Record<string, number>;
    generated_at: string;
};

export default function SbomTabView({ jobId, sbomStatus: initialStatus }: SbomTabViewProps) {
    const [status, setStatus] = useState(initialStatus);
    const [summary, setSummary] = useState<SbomSummary | null>(null);
    const [loading, setLoading] = useState(false);

    // Listen for SSE sbom_export_complete event
    useEffect(() => {
        if (status === "ready") return;
        const es = new EventSource(`/api/jobs/${jobId}/events`);
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.stage === "sbom_export_complete") {
                    setStatus("ready");
                    es.close();
                }
            } catch {}
        };
        return () => es.close();
    }, [jobId, status]);

    // Fetch summary when ready
    useEffect(() => {
        if (status !== "ready") return;
        fetch(`/api/jobs/${jobId}/sbom/summary`)
            .then((r) => r.json())
            .then((d) => setSummary(d))
            .catch(() => {});
    }, [jobId, status]);

    if (status === "pending") {
        return (
            <div className="flex items-center gap-3 p-8 text-gray-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating SBOMs...
            </div>
        );
    }

    if (status === "failed") {
        return <div className="p-8 text-red-400">SBOM generation failed.</div>;
    }

    const formats = [
        { key: "cyclonedx", label: "CycloneDX", ext: "cdx.json" },
        { key: "spdx", label: "SPDX", ext: "spdx.json" },
        { key: "syft", label: "Syft", ext: "syft.json" },
    ];

    return (
        <div className="space-y-6 p-4">
            {/* Stats Panel */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-400">Total Packages</div>
                        <div className="text-2xl font-bold">{summary.total_packages}</div>
                    </div>
                    {Object.entries(summary.ecosystems)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([eco, count]) => (
                            <div key={eco} className="bg-gray-800 rounded-lg p-4">
                                <div className="text-sm text-gray-400">{eco}</div>
                                <div className="text-2xl font-bold">{count}</div>
                            </div>
                        ))}
                </div>
            )}

            {/* Download Buttons */}
            <div className="flex gap-3">
                {formats.map((fmt) => (
                    <a
                        key={fmt.key}
                        href={`/api/jobs/${jobId}/sbom?format=${fmt.key}`}
                        download
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                    >
                        Download {fmt.label}
                    </a>
                ))}
            </div>

            {/* Package Table — placeholder for Task 3.4 */}
            <div className="text-sm text-gray-500">Package table coming soon.</div>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/components/SbomTabView.tsx
git commit -m "feat(sbom): create SbomTabView component with stats and download"
```

---

### Task 3.3: Add SBOM API routes

**Files:**
- Create: `scanrook-ui/src/app/api/jobs/[id]/sbom/route.ts`
- Create: `scanrook-ui/src/app/api/jobs/[id]/sbom/summary/route.ts`

**Step 1: Download route**

Create `src/app/api/jobs/[id]/sbom/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_VIEWER } from "@/lib/roles";
import { s3Internal } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";

const FORMAT_MAP: Record<string, string> = {
    cyclonedx: "sbom.cdx.json",
    spdx: "sbom.spdx.json",
    syft: "sbom.syft.json",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireRequestActor(req, { requiredRoles: [ROLE_VIEWER] });
    if ("response" in auth) return auth.response;

    const { id } = await params;
    const format = req.nextUrl.searchParams.get("format") || "cyclonedx";
    const ext = FORMAT_MAP[format];
    if (!ext) {
        return NextResponse.json({ error: "Invalid format. Use: cyclonedx, spdx, syft" }, { status: 400 });
    }

    // Get job to find report key and verify org access
    const row = await prisma.$queryRawUnsafe<any[]>(
        `SELECT report_bucket, report_key, org_id, sbom_status FROM scan_jobs WHERE id = $1`,
        id,
    );
    if (!row.length) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (row[0].org_id !== auth.actor.orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (row[0].sbom_status !== "ready") {
        return NextResponse.json({ error: "SBOMs not ready yet", sbom_status: row[0].sbom_status }, { status: 409 });
    }

    // Build SBOM S3 key from report key: "reports/<id>.json" → "reports/<id>.sbom.cdx.json"
    const sbomKey = row[0].report_key.replace(/\.json$/, `.${ext}`);

    const url = await getSignedUrl(
        s3Internal,
        new GetObjectCommand({ Bucket: row[0].report_bucket, Key: sbomKey }),
        { expiresIn: 300 },
    );

    return NextResponse.json({ url, format, filename: `${id}.${ext}` });
}
```

**Step 2: Summary route**

Create `src/app/api/jobs/[id]/sbom/summary/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_VIEWER } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireRequestActor(req, { requiredRoles: [ROLE_VIEWER] });
    if ("response" in auth) return auth.response;

    const { id } = await params;

    // Get packages from scan_packages table, group by ecosystem
    const rows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT ecosystem, COUNT(*)::int as count
         FROM scan_packages WHERE job_id = $1
         GROUP BY ecosystem ORDER BY count DESC`,
        id,
    );

    const totalRow = await prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*)::int as total FROM scan_packages WHERE job_id = $1`,
        id,
    );

    const ecosystems: Record<string, number> = {};
    for (const r of rows) {
        ecosystems[r.ecosystem] = r.count;
    }

    return NextResponse.json({
        total_packages: totalRow[0]?.total || 0,
        ecosystems,
    });
}
```

**Step 3: Commit**

```bash
git add src/app/api/jobs/\[id\]/sbom/
git commit -m "feat(sbom): add download and summary API routes"
```

---

### Task 3.4: Package inventory table in SBOM tab

**Files:**
- Modify: `scanrook-ui/src/components/SbomTabView.tsx` (replace placeholder)

**Step 1: Add package table with search/sort/pagination**

Replace the placeholder `<div>Package table coming soon.</div>` with a full table component that fetches from `GET /api/jobs/[id]/packages` (already exists). Include columns: name, version, ecosystem, PURL, confidence tier. Add a search input and sortable column headers.

This task can reference the existing `PackagesTable.tsx` (19KB at `src/components/PackagesTable.tsx`) for patterns — or embed a simpler version directly in SbomTabView.

**Step 2: Commit**

```bash
git add src/components/SbomTabView.tsx
git commit -m "feat(sbom): add package inventory table to SBOM tab"
```

---

## Phase 4: SBOM Diff & Baselines

### Task 4.1: Add sbom_diff_summary column to scan_jobs

**Files:**
- Modify: `scanrook-ui/src/lib/prisma.ts` (schema bootstrap)
- Modify: `rust-scanner-worker/internal/db/db.go` (add diff functions)

**Step 1: Add column**

In `prisma.ts`, add with the other ALTER TABLE statements:

```sql
ALTER TABLE scan_jobs ADD COLUMN IF NOT EXISTS sbom_diff_summary JSONB;
```

**Step 2: Add DB functions in worker**

Add to `rust-scanner-worker/internal/db/db.go`:

```go
// FindPreviousDoneJob finds the most recent completed job with the same original_filename in the same org.
func (d *DB) FindPreviousDoneJob(ctx context.Context, jobID, orgID, originalFilename string) (string, string, string, error) {
	var prevID, prevBucket, prevKey string
	err := d.pool.QueryRow(ctx,
		`SELECT id, report_bucket, report_key FROM scan_jobs
		 WHERE org_id = $1 AND original_filename = $2 AND status = 'done'
		   AND id != $3
		 ORDER BY finished_at DESC LIMIT 1`,
		orgID, originalFilename, jobID,
	).Scan(&prevID, &prevBucket, &prevKey)
	return prevID, prevBucket, prevKey, err
}

// UpdateSbomDiffSummary stores the diff summary JSON on the job.
func (d *DB) UpdateSbomDiffSummary(ctx context.Context, jobID string, diffSummary []byte) error {
	_, err := d.pool.Exec(ctx,
		`UPDATE scan_jobs SET sbom_diff_summary = $1 WHERE id = $2`,
		diffSummary, jobID,
	)
	return err
}
```

**Step 3: Commit both**

```bash
cd ~/Desktop/GitHub/go/rust-scanner-worker
git add internal/db/db.go
git commit -m "feat(sbom): add FindPreviousDoneJob and UpdateSbomDiffSummary"

cd ~/Desktop/GitHub/Javascript/deltaguard
git add src/lib/prisma.ts
git commit -m "feat(sbom): add sbom_diff_summary column to scan_jobs"
```

---

### Task 4.2: Automatic diff after SBOM export

**Files:**
- Modify: `rust-scanner-worker/internal/worker/sbom.go` (add diff step)

**Step 1: Add diff generation to the post-scan goroutine**

Add a `generateSbomDiff` method to Runner in `sbom.go`:

```go
// generateSbomDiff compares the current report against the previous scan's report.
func (r *Runner) generateSbomDiff(ctx context.Context, jobID, orgID, originalFilename, reportPath, reportBucket, reportKey string) {
	prevID, prevBucket, prevKey, err := r.db.FindPreviousDoneJob(ctx, jobID, orgID, originalFilename)
	if err != nil {
		log.Printf("[job=%s] no previous scan for diff (first baseline): %v", jobID, err)
		return
	}

	// Download previous report
	prevPath := reportPath + ".prev.json"
	if err := r.s3.DownloadFile(ctx, prevBucket, prevKey, prevPath); err != nil {
		log.Printf("[job=%s] failed to download previous report for diff: %v", jobID, err)
		return
	}
	defer os.Remove(prevPath)

	// Run diff
	diffPath := reportPath + ".diff.json"
	cmd := exec.CommandContext(ctx, r.cfg.ScannerPath,
		"sbom", "diff",
		"--baseline", prevPath,
		"--current", reportPath,
		"--json", "--out", diffPath,
	)
	cmd.Env = os.Environ()
	if output, err := cmd.CombinedOutput(); err != nil {
		log.Printf("[job=%s] sbom diff failed: %v: %s", jobID, err, string(output))
		return
	}
	defer os.Remove(diffPath)

	// Upload diff to S3
	diffKey := strings.TrimSuffix(reportKey, ".json") + ".sbom-diff.json"
	if err := r.s3.UploadFileWithRetry(ctx, reportBucket, diffKey, diffPath, 3, 200*time.Millisecond); err != nil {
		log.Printf("[job=%s] sbom diff upload failed: %v", jobID, err)
		return
	}

	// Store diff summary in DB
	diffData, _ := os.ReadFile(diffPath)
	var diffObj map[string]json.RawMessage
	if err := json.Unmarshal(diffData, &diffObj); err == nil {
		if summary, ok := diffObj["summary"]; ok {
			r.db.UpdateSbomDiffSummary(ctx, jobID, summary)
		}
	}

	// Emit SSE event
	r.db.InsertEvent(ctx, jobID, time.Now(), "sbom_diff_complete",
		fmt.Sprintf("Compared against previous scan %s", prevID), 100)

	log.Printf("[job=%s] sbom diff generated against %s", jobID, prevID)
}
```

**Step 2: Call it from the post-scan goroutine**

In the goroutine added in Task 2.3, after `generateSbomExports`, add:

```go
r.generateSbomDiff(sbomCtx, j.ID, j.OrgID, j.OriginalFilename, reportPath, reportBucket, reportKey)
```

Note: ensure the `Job` struct (in model/) exposes `OrgID` and `OriginalFilename`. Check and add them if missing.

**Step 3: Commit**

```bash
git add internal/worker/sbom.go internal/worker/runner.go
git commit -m "feat(sbom): automatic baseline diff after scan completion"
```

---

### Task 4.3: Manual compare API route

**Files:**
- Create: `scanrook-ui/src/app/api/jobs/compare/route.ts`
- Create: `scanrook-ui/src/app/api/jobs/[id]/sbom/diff/route.ts`

**Step 1: Compare endpoint**

The compare endpoint stores a request in DB. For simplicity in v1, it can run the diff synchronously by downloading both reports, shelling out to the scanner binary. But per our design, the scanner binary isn't on the web server.

Alternative: the compare endpoint writes a row to a `sbom_diff_requests` table, the worker picks it up, runs the diff, and stores the result. Or simpler: just serve the pre-generated diff from S3 for automatic diffs, and for manual compare, return the two jobs' package lists for client-side comparison.

For v1, implement `GET /api/jobs/[id]/sbom/diff` which returns the pre-generated diff JSON from S3 (if it exists):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_VIEWER } from "@/lib/roles";
import { s3Internal } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireRequestActor(req, { requiredRoles: [ROLE_VIEWER] });
    if ("response" in auth) return auth.response;

    const { id } = await params;
    const row = await prisma.$queryRawUnsafe<any[]>(
        `SELECT report_bucket, report_key, org_id, sbom_diff_summary FROM scan_jobs WHERE id = $1`,
        id,
    );
    if (!row.length) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (row[0].org_id !== auth.actor.orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!row[0].sbom_diff_summary) {
        return NextResponse.json({ error: "No diff available (first scan or diff not yet generated)" }, { status: 404 });
    }

    // Return diff summary from DB (fast) + presigned URL for full diff
    const diffKey = row[0].report_key.replace(/\.json$/, ".sbom-diff.json");
    const url = await getSignedUrl(
        s3Internal,
        new GetObjectCommand({ Bucket: row[0].report_bucket, Key: diffKey }),
        { expiresIn: 300 },
    );

    return NextResponse.json({
        summary: row[0].sbom_diff_summary,
        full_diff_url: url,
    });
}
```

**Step 2: Commit**

```bash
git add src/app/api/jobs/\[id\]/sbom/diff/
git commit -m "feat(sbom): add diff API route"
```

---

### Task 4.4: Diff view in SBOM tab

**Files:**
- Modify: `scanrook-ui/src/components/SbomTabView.tsx`

**Step 1: Add diff section**

After the download buttons, add a "Changes from baseline" section that fetches from `/api/jobs/[id]/sbom/diff`. Show summary badges (+N added, -N removed, N changed) and a color-coded table.

This is a UI-only change using the API from Task 4.3.

**Step 2: Commit**

```bash
git add src/components/SbomTabView.tsx
git commit -m "feat(sbom): add baseline diff view to SBOM tab"
```

---

## Phase 5: Policy Gates

### Task 5.1: Create sbom_policies and policy_checks tables

**Files:**
- Modify: `scanrook-ui/src/lib/prisma.ts`

**Step 1: Add tables to schema bootstrap**

```sql
CREATE TABLE IF NOT EXISTS sbom_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rules JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sbom_policies_org ON sbom_policies(org_id);

CREATE TABLE IF NOT EXISTS policy_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES scan_jobs(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES sbom_policies(id) ON DELETE CASCADE,
    passed BOOLEAN NOT NULL,
    violations JSONB NOT NULL DEFAULT '[]',
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_policy_checks_job ON policy_checks(job_id);
CREATE INDEX IF NOT EXISTS idx_policy_checks_org ON policy_checks(org_id);
```

**Step 2: Commit**

```bash
git add src/lib/prisma.ts
git commit -m "feat(sbom): add sbom_policies and policy_checks tables"
```

---

### Task 5.2: Policy CRUD API routes

**Files:**
- Create: `scanrook-ui/src/app/api/org/policies/route.ts`
- Create: `scanrook-ui/src/app/api/org/policies/[id]/route.ts`

**Step 1: Implement CRUD**

`GET /api/org/policies` — list org policies (requires ROLE_POLICY_ADMIN)
`POST /api/org/policies` — create policy with `{ name, rules, is_default }`
`PUT /api/org/policies/[id]` — update policy
`DELETE /api/org/policies/[id]` — delete policy

Follow the same pattern as `src/app/api/org/api-keys/route.ts` for auth and org scoping.

When setting `is_default = true`, unset any existing default for the org first:
```sql
UPDATE sbom_policies SET is_default = false WHERE org_id = $1 AND is_default = true;
```

**Step 2: Commit**

```bash
git add src/app/api/org/policies/
git commit -m "feat(sbom): add policy CRUD API routes"
```

---

### Task 5.3: Worker automatic policy evaluation

**Files:**
- Modify: `rust-scanner-worker/internal/worker/sbom.go`
- Modify: `rust-scanner-worker/internal/db/db.go`

**Step 1: Add DB functions**

```go
// GetDefaultPolicy returns the default SBOM policy for an org, if one exists.
func (d *DB) GetDefaultPolicy(ctx context.Context, orgID string) (string, []byte, error) {
	var policyID string
	var rules []byte
	err := d.pool.QueryRow(ctx,
		`SELECT id, rules FROM sbom_policies WHERE org_id = $1 AND is_default = true LIMIT 1`,
		orgID,
	).Scan(&policyID, &rules)
	return policyID, rules, err
}

// InsertPolicyCheck records a policy evaluation result.
func (d *DB) InsertPolicyCheck(ctx context.Context, orgID, jobID, policyID string, passed bool, violations []byte) error {
	_, err := d.pool.Exec(ctx,
		`INSERT INTO policy_checks (org_id, job_id, policy_id, passed, violations) VALUES ($1, $2, $3, $4, $5)`,
		orgID, jobID, policyID, passed, violations,
	)
	return err
}
```

**Step 2: Add policy check to post-scan goroutine**

In `sbom.go`, add `evaluatePolicy` method and call it after diff:

```go
func (r *Runner) evaluatePolicy(ctx context.Context, jobID, orgID, reportPath, diffPath string) {
	policyID, rules, err := r.db.GetDefaultPolicy(ctx, orgID)
	if err != nil {
		// No default policy — skip
		return
	}

	// Write policy rules to temp file
	policyPath := reportPath + ".policy.json"
	os.WriteFile(policyPath, rules, 0644)
	defer os.Remove(policyPath)

	// Run policy check
	resultPath := reportPath + ".policy-result.json"
	args := []string{"sbom", "policy", "--policy", policyPath, "--diff", diffPath}
	if reportPath != "" {
		args = append(args, "--report", reportPath)
	}

	cmd := exec.CommandContext(ctx, r.cfg.ScannerPath, args...)
	cmd.Env = os.Environ()
	output, _ := cmd.CombinedOutput()

	// Parse result
	var result struct {
		Passed     bool            `json:"passed"`
		Violations json.RawMessage `json:"violations"`
	}
	json.Unmarshal(output, &result)

	// Store in DB
	r.db.InsertPolicyCheck(ctx, orgID, jobID, policyID, result.Passed, result.Violations)

	// SSE event
	detail := "Policy check passed"
	if !result.Passed {
		detail = "Policy check FAILED"
	}
	r.db.InsertEvent(ctx, jobID, time.Now(), "policy_check_complete", detail, 100)
}
```

**Step 3: Commit**

```bash
git add internal/worker/sbom.go internal/db/db.go
git commit -m "feat(sbom): automatic policy evaluation after diff"
```

---

### Task 5.4: Policy management UI on org settings page

**Files:**
- Create: `scanrook-ui/src/components/PolicyManager.tsx`
- Modify: `scanrook-ui/src/app/(dashboard)/dashboard/settings/org/page.tsx`

**Step 1: Build PolicyManager component**

A form for creating/editing policies with:
- Name input
- Number inputs for `max_new_critical` and `max_new_high`
- Text area for `deny_list` (one pattern per line)
- Toggle for `block_removed`
- Toggle for `block_kev`
- Checkbox for `is_default`
- Table listing existing policies with edit/delete actions

Follow the same patterns as the API key management UI at `src/app/(dashboard)/dashboard/settings/api-keys/page.tsx`.

**Step 2: Add to org settings page**

Add a "Policies" section to the org settings page, rendering `<PolicyManager />`.

**Step 3: Commit**

```bash
git add src/components/PolicyManager.tsx
git add src/app/\(dashboard\)/dashboard/settings/org/page.tsx
git commit -m "feat(sbom): add policy management UI to org settings"
```

---

### Task 5.5: Policy check result API and job detail badge

**Files:**
- Create: `scanrook-ui/src/app/api/jobs/[id]/policy-result/route.ts`
- Modify: `scanrook-ui/src/components/JobDetailTabs.tsx` or relevant job card component

**Step 1: Policy result API**

```typescript
// GET /api/jobs/[id]/policy-result
// Returns latest policy check for this job
const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT pc.passed, pc.violations, pc.checked_at, sp.name as policy_name
     FROM policy_checks pc
     JOIN sbom_policies sp ON sp.id = pc.policy_id
     WHERE pc.job_id = $1 ORDER BY pc.checked_at DESC LIMIT 1`,
    id,
);
```

**Step 2: Add pass/fail badge to job detail page**

Show a green "Policy: Passed" or red "Policy: Failed (N violations)" badge.

**Step 3: Commit**

```bash
git add src/app/api/jobs/\[id\]/policy-result/ src/components/
git commit -m "feat(sbom): add policy check result API and job detail badge"
```

---

## Phase 6: Dedicated SBOM Page

### Task 6.1: Create SBOM page with three tabs

**Files:**
- Create: `scanrook-ui/src/app/(dashboard)/dashboard/sbom/page.tsx`
- Modify: `scanrook-ui/src/components/DashboardNavClient.tsx:17-29` (add nav link)

**Step 1: Add nav link**

In `DashboardNavClient.tsx`, add after the Dashboard link (line ~20):

```tsx
<Link href="/dashboard/sbom" className="app-nav-link">SBOM</Link>
```

**Step 2: Create page with Overview / Compare / Policies tabs**

Build the page with three tabs. Each tab is a separate section:

- **Overview**: Fetch org-wide stats via a new API route `GET /api/org/sbom/overview`
- **Compare**: Two job selectors + compare button + inline results
- **Policies**: Read-only list + policy check history + link to org settings

**Step 3: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/sbom/ src/components/DashboardNavClient.tsx
git commit -m "feat(sbom): add dedicated SBOM page with overview, compare, policies tabs"
```

---

### Task 6.2: SBOM overview API route

**Files:**
- Create: `scanrook-ui/src/app/api/org/sbom/overview/route.ts`

**Step 1: Implement**

```typescript
// Returns org-wide SBOM stats:
// - total scans with sbom_status='ready'
// - total unique packages
// - ecosystem distribution
// - recent policy checks
// - targets with baselines (unique original_filenames with scan count)

const stats = await prisma.$queryRawUnsafe<any[]>(
    `SELECT
        COUNT(*) FILTER (WHERE sbom_status = 'ready')::int as sbom_scans,
        COUNT(DISTINCT original_filename)::int as unique_targets
     FROM scan_jobs WHERE org_id = $1 AND status = 'done'`,
    actor.orgId,
);
```

**Step 2: Commit**

```bash
git add src/app/api/org/sbom/
git commit -m "feat(sbom): add org SBOM overview API route"
```

---

### Task 6.3: Manual compare UI + API

**Files:**
- Create: `scanrook-ui/src/app/api/jobs/compare/route.ts`
- Part of the SBOM page Compare tab

**Step 1: Compare API**

`POST /api/jobs/compare` accepts `{ baseline_job_id, current_job_id }`. Both must belong to the actor's org. Fetches packages from both jobs' `scan_packages` tables and computes a diff server-side (package set difference by name+ecosystem+version). Returns added/removed/changed arrays.

This avoids needing the scanner binary on the web server — it's a simpler DB-level diff rather than the full scanner diff. The scanner diff (via worker) is for automatic baselines; this is for ad-hoc comparison.

**Step 2: Commit**

```bash
git add src/app/api/jobs/compare/
git commit -m "feat(sbom): add manual scan comparison API"
```

---

## Phase 7: Dependency Graph

### Task 7.1: Install react-force-graph-2d

**Files:**
- Modify: `scanrook-ui/package.json`

**Step 1: Install**

```bash
cd ~/Desktop/GitHub/Javascript/deltaguard
npm install react-force-graph-2d
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install react-force-graph-2d for SBOM dependency graph"
```

---

### Task 7.2: Build DependencyGraph component

**Files:**
- Create: `scanrook-ui/src/components/DependencyGraph.tsx`

**Step 1: Build component**

```tsx
"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type Package = {
    name: string;
    version: string;
    ecosystem: string;
    purl: string;
    vuln_count?: number;
    max_severity?: string;
};

type DependencyGraphProps = {
    packages: Package[];
    dependencies: Array<{ source: string; target: string }>;
};

const ECO_COLORS: Record<string, string> = {
    npm: "#339933",
    pypi: "#3776AB",
    cargo: "#CE422B",
    go: "#00ADD8",
    gem: "#CC342D",
    deb: "#A81D33",
    rpm: "#EE0000",
    apk: "#0D597F",
    maven: "#C71A36",
    nuget: "#512BD4",
};

export default function DependencyGraph({ packages, dependencies }: DependencyGraphProps) {
    const [selectedNode, setSelectedNode] = useState<Package | null>(null);
    const [filter, setFilter] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");

    const graphData = useMemo(() => {
        const nodes = packages
            .filter((p) => filter.size === 0 || filter.has(p.ecosystem))
            .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
            .map((p) => ({
                id: p.purl || `${p.ecosystem}/${p.name}@${p.version}`,
                name: p.name,
                version: p.version,
                ecosystem: p.ecosystem,
                vuln_count: p.vuln_count || 0,
                max_severity: p.max_severity,
                val: Math.max(1, (p.vuln_count || 0) + 1),
            }));

        const nodeIds = new Set(nodes.map((n) => n.id));
        const links = dependencies
            .filter((d) => nodeIds.has(d.source) && nodeIds.has(d.target))
            .map((d) => ({ source: d.source, target: d.target }));

        return { nodes, links };
    }, [packages, dependencies, filter, search]);

    const ecosystems = [...new Set(packages.map((p) => p.ecosystem))].sort();

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center">
                <input
                    type="text"
                    placeholder="Search packages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                />
                {ecosystems.map((eco) => (
                    <button
                        key={eco}
                        onClick={() => {
                            const next = new Set(filter);
                            next.has(eco) ? next.delete(eco) : next.add(eco);
                            setFilter(next);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                            filter.size === 0 || filter.has(eco)
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-400"
                        }`}
                        style={filter.size === 0 || filter.has(eco) ? { backgroundColor: ECO_COLORS[eco] || "#666" } : {}}
                    >
                        {eco}
                    </button>
                ))}
            </div>

            {/* Graph */}
            <div className="border border-gray-700 rounded-lg overflow-hidden" style={{ height: 500 }}>
                <ForceGraph2D
                    graphData={graphData}
                    nodeLabel={(node: any) => `${node.name}@${node.version}`}
                    nodeColor={(node: any) => ECO_COLORS[node.ecosystem] || "#666"}
                    nodeRelSize={4}
                    linkColor={() => "#444"}
                    onNodeClick={(node: any) => setSelectedNode(node)}
                    nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                        const r = Math.sqrt(node.val) * 4;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
                        ctx.fillStyle = ECO_COLORS[node.ecosystem] || "#666";
                        ctx.fill();
                        // Red ring for vulnerable packages
                        if (node.vuln_count > 0) {
                            ctx.strokeStyle = "#ef4444";
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                        // Label
                        if (globalScale > 1.5) {
                            ctx.fillStyle = "#fff";
                            ctx.font = `${10 / globalScale}px sans-serif`;
                            ctx.textAlign = "center";
                            ctx.fillText(node.name, node.x, node.y + r + 8 / globalScale);
                        }
                    }}
                />
            </div>

            {/* Selected node detail */}
            {selectedNode && (
                <div className="bg-gray-800 rounded-lg p-4 text-sm">
                    <div className="font-bold">{(selectedNode as any).name}@{(selectedNode as any).version}</div>
                    <div className="text-gray-400">{(selectedNode as any).ecosystem}</div>
                    {(selectedNode as any).vuln_count > 0 && (
                        <div className="text-red-400 mt-1">{(selectedNode as any).vuln_count} vulnerabilities</div>
                    )}
                </div>
            )}
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/components/DependencyGraph.tsx
git commit -m "feat(sbom): add DependencyGraph component with ecosystem colors and vuln indicators"
```

---

### Task 7.3: Integrate graph into SBOM tab

**Files:**
- Modify: `scanrook-ui/src/components/SbomTabView.tsx`

**Step 1: Add graph section**

After the package table, add a "View dependency graph" button that lazy-loads the `DependencyGraph` component. For 500+ packages, default to table view.

Fetch dependency data from the SBOM summary endpoint (extend it to include CycloneDX dependencies if available).

**Step 2: Commit**

```bash
git add src/components/SbomTabView.tsx
git commit -m "feat(sbom): integrate dependency graph into SBOM tab"
```

---

## Phase 8: SSE & Workflow Integration

### Task 8.1: Add SBOM events to workflow stages

**Files:**
- Modify: `scanrook-ui/src/lib/workflowStages.ts:96,114,139`

**Step 1: Add new stage mappings**

Add mappings for the new SBOM events:

```typescript
if (s === "sbom_export_complete") return "sbom_export";
if (s === "sbom_diff_complete") return "sbom_diff";
if (s === "policy_check_complete") return "policy_check";
```

Add these stages to the workflow stages array if needed.

**Step 2: Commit**

```bash
git add src/lib/workflowStages.ts
git commit -m "feat(sbom): add SBOM export, diff, and policy events to workflow stages"
```

---

### Task 8.2: SBOM badge on scan dashboard job cards

**Files:**
- Modify: `scanrook-ui/src/components/PackagesTable.tsx` or the job list component

**Step 1: Show SBOM badge**

When a job has `target.type === "sbom"` or `sbom_status === "ready"`, show badges on the job card in the dashboard list.

**Step 2: Commit**

```bash
git add src/components/
git commit -m "feat(sbom): show SBOM badge on dashboard job cards"
```

---

## Build & Deploy

### Task 9.1: Build and push scanner

```bash
cd ~/Desktop/GitHub/Rust/rust_scanner
cargo build --release
# Create GitHub release for v1.14.0
gh release create v1.14.0 --title "v1.14.0 - SBOM Export" --notes "Added sbom export subcommand"
```

### Task 9.2: Build and push worker image

```bash
cd ~/Desktop/GitHub/go/rust-scanner-worker
docker build --platform linux/amd64 -t devintripp/rust-scanner-worker:k8s-scheduler-v8 .
docker push devintripp/rust-scanner-worker:k8s-scheduler-v8
```

### Task 9.3: Build and push UI image

```bash
cd ~/Desktop/GitHub/Javascript/deltaguard
docker build --platform linux/amd64 -t devintripp/deltaguard-ui:v1.15.0 .
docker push devintripp/deltaguard-ui:v1.15.0
```

### Task 9.4: Update K8s manifests and deploy

Update `k8s/scanrook/deployment.yaml` and `k8s/scanrook/dispatcher-deployment.yaml` with new image tags. ArgoCD will sync automatically.

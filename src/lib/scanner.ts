import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type ScanCommand =
  | { type: "BIN"; path: string }
  | { type: "CONTAINER"; tar: string }
  | { type: "LICENSE"; path: string }
  | { type: "VULN"; component: string; version: string }
  | { type: "REDHAT"; cve: string; oval: string };

export type ScanResult = {
  stdout: string;
  stderr: string;
  code: number | null;
};

const SCANNER_MODE = (process.env.SCANNER_MODE ?? "system") as
  | "local"
  | "docker"
  | "mock"
  | "system";
const SCANNER_IMAGE = process.env.SCANNER_IMAGE ?? "devintripp/deltaguard:1.0.2";
const SCANNER_USE_PROGRESS = (process.env.SCANNER_USE_PROGRESS ?? "true").toLowerCase() === "true";
// Progress files directory can be overridden by PROGRESS_DIR
const PROGRESS_DIR = process.env.PROGRESS_DIR || "/tmp/deltaguard";

export type RunOptions = {
  progressFilePath?: string;
  scanId?: string;
};

// Track running scans so we can cancel them
const runningScans = new Map<string, ReturnType<typeof spawn>>();
export function cancelScanById(scanId: string): boolean {
  const child = runningScans.get(scanId);
  if (!child) return false;
  try {
    child.kill("SIGTERM");
    setTimeout(() => { try { child.kill("SIGKILL"); } catch { } }, 1500);
  } catch { }
  runningScans.delete(scanId);
  return true;
}

function buildArgs(command: ScanCommand): string[] {
  switch (command.type) {
    case "BIN":
      // Use unified scan command; it auto-detects input type
      return ["scan", "--file", command.path, "--format", "json"];
    case "CONTAINER":
      return ["scan", "--file", command.tar, "--format", "json"];
    case "LICENSE":
      // Route license through unified scan as well
      return ["scan", "--file", command.path, "--format", "json"];
    case "VULN":
      return ["vuln", "--component", command.component, "--version", command.version, "--format", "json"];
    case "REDHAT":
      return ["redhat", "--cve", command.cve, "--oval", command.oval, "--format", "json"];
  }
}

export function runScanner(command: ScanCommand, cwd?: string, options?: RunOptions): Promise<ScanResult> {
  if (SCANNER_MODE === "mock") {
    const text = buildMockOutput(command);
    return Promise.resolve({ stdout: text, stderr: "", code: 0 });
  }
  if (SCANNER_MODE === "docker") {
    // Mount uploads dir into /data inside container
    const uploads = process.env.UPLOADS_DIR ?? "var/uploads";
    const progressArgs: string[] = SCANNER_USE_PROGRESS && options?.progressFilePath
      ? ["--progress", "--progress-file", options.progressFilePath]
      : [];
    const args = [
      "run",
      "--rm",
      "-v",
      `${path.resolve(uploads)}:/data`,
      SCANNER_IMAGE,
      ...progressArgs,
      ...buildArgs(mapPathsToContainer(command)),
    ];
    return spawnPromise("docker", args, cwd);
  }
  if (SCANNER_MODE === "system") {
    // Use scanner from PATH
    const baseName = process.platform === "win32" ? "scanner.exe" : "scanner";
    // Ensure progress dir exists if using progress
    if (SCANNER_USE_PROGRESS) {
      try {
        const dir = options?.progressFilePath ? path.dirname(options.progressFilePath) : PROGRESS_DIR;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      } catch { }
    }
    const progressArgs: string[] = SCANNER_USE_PROGRESS && options?.progressFilePath
      ? ["--progress", "--progress-file", options.progressFilePath]
      : [];
    const args = [...progressArgs, ...buildArgs(command)];
    return spawnPromise(baseName, args, cwd);
  }

  // local default
  const localBinary = process.platform === "win32" ? "scanner.exe" : "scanner";
  const candidate = path.resolve(process.cwd(), localBinary);
  const binary = fs.existsSync(candidate) ? candidate : localBinary;
  const progressArgs: string[] = SCANNER_USE_PROGRESS && options?.progressFilePath
    ? ["--progress", "--progress-file", options.progressFilePath]
    : [];
  return spawnPromise(binary, [...progressArgs, ...buildArgs(command)], cwd);
}

function mapPathsToContainer(command: ScanCommand): ScanCommand {
  const toContainerPath = (p: string) => {
    const uploads = process.env.UPLOADS_DIR ?? "var/uploads";
    const resolved = path.resolve(p);
    return resolved.replace(path.resolve(uploads), "/data");
  };
  switch (command.type) {
    case "BIN":
      return { type: "BIN", path: toContainerPath(command.path) };
    case "CONTAINER":
      return { type: "CONTAINER", tar: toContainerPath(command.tar) };
    case "LICENSE":
      return { type: "LICENSE", path: toContainerPath(command.path) };
    case "VULN":
      return command;
    case "REDHAT":
      return command;
  }
}

function spawnPromise(cmd: string, args: string[], cwd?: string, options?: RunOptions): Promise<ScanResult> {
  return new Promise((resolve, reject) => {
    try { console.log("[scanner] spawn", { cmd, args, cwd, mode: SCANNER_MODE }); } catch { }
    const child = spawn(cmd, args, { cwd, env: process.env });
    if (options?.scanId) runningScans.set(options.scanId, child);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err: unknown) => {
      const code = (err as NodeJS.ErrnoException | undefined)?.code;
      if (code === "ENOENT") {
        // Retry via shell so interactive PATH initialization (if any) can locate the binary
        const isWin = process.platform === "win32";
        const q = (s: string) => `'${s.replace(/'/g, "'\\''")}'`;
        const cmdline = [cmd, ...args.map(q)].join(" ");
        const shell = isWin ? "cmd" : "/bin/sh";
        const shellArgs = isWin ? ["/c", cmdline] : ["-lc", cmdline];
        try { console.warn("[scanner] ENOENT; retry via shell", { shell, cmdline }); } catch { }
        let sOut = ""; let sErr = "";
        const sh = spawn(shell, shellArgs, { cwd, env: process.env });
        sh.stdout.on("data", (d) => (sOut += d.toString()));
        sh.stderr.on("data", (d) => (sErr += d.toString()));
        sh.on("close", (code2) => {
          try { console.log("[scanner] shell exit", { code2, stderrPreview: (sErr || "").slice(0, 300) }); } catch { }
          if (code2 === 0 || code2 === null) {
            if (options?.scanId) runningScans.delete(options.scanId);
            return resolve({ stdout: sOut, stderr: sErr, code: code2 });
          }
          const msg = `scanner not found or failed via shell. PATH=${process.env.PATH || ""}`;
          return resolve({ stdout: sOut, stderr: sErr || msg, code: code2 ?? 1 });
        });
        sh.on("error", () => {
          const msg = `scanner not found on PATH (tried '${cmd}'). Ensure it's installed and PATH is set.`;
          return resolve({ stdout: "", stderr: msg, code: 1 });
        });
        return;
      }
      try { console.error("[scanner] spawn error", String(err)); } catch { }
      reject(err);
    });
    child.on("close", (code) => {
      if (options?.scanId) runningScans.delete(options.scanId);
      try { console.log("[scanner] exit", { code, stderrPreview: (stderr || "").slice(0, 300) }); } catch { }
      resolve({ stdout, stderr, code });
    });
  });
}

export type NormalizedFinding = {
  id: string;
  title?: string;
  description?: string;
  severity?: string;
  source?: string;
};

export type NormalizedScan = {
  findings: NormalizedFinding[];
  meta?: Record<string, unknown>;
};

export function parseScannerTextToNormalized(stdout: string): NormalizedScan | null {
  const lines = stdout.split(/\r?\n/);
  const findings: NormalizedFinding[] = [];
  for (const line of lines) {
    const match = line.match(/CVE-\d{4}-\d{4,7}/i);
    if (match) {
      const id = match[0];
      const after = line.split(":").slice(1).join(":").trim();
      findings.push({ id, description: after || undefined, source: "NVD" });
    }
  }
  if (findings.length === 0) return null;
  return { findings };
}

export function parseScannerOutputAuto(text: string): NormalizedScan | null {
  try {
    const j = JSON.parse(text);
    const findings: NormalizedFinding[] = Array.isArray(j.findings)
      ? j.findings.map((f: Record<string, unknown>) => ({
        id: String((f as any).id || ""),
        description: (f as any).description || undefined,
        severity: (f as any).severity || undefined,
        source: ((f as any).source_ids && (f as any).source_ids[0]) || undefined,
      }))
      : [];
    return { findings };
  } catch {
    return parseScannerTextToNormalized(text);
  }
}

function buildMockOutput(command: ScanCommand): string {
  if (command.type === "VULN") {
    const { component, version } = command;
    return `Querying NVD: https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${component}%20${version}&resultsPerPage=10\n` +
      `🔹 CVE-2018-20679: Example issue in ${component} before ${version}.\n` +
      `🔹 CVE-2019-5747: Another issue in ${component} through ${version}.`;
  }
  if (command.type === "BIN") {
    return `Analyzing binary: ${command.path}\n` +
      `🔹 CVE-2021-1111: Example binary vulnerability.\n` +
      `No further issues found.`;
  }
  if (command.type === "CONTAINER") {
    return `Analyzing container tar: ${command.tar}\n` +
      `🔹 CVE-2022-2222: Example container base image vulnerability.`;
  }
  return `No issues found.`;
}



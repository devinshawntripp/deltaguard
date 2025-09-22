import { spawn } from "node:child_process";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

type ScanCommand =
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

const SCANNER_MODE = process.env.SCANNER_MODE ?? "local"; // local | docker | mock
const SCANNER_IMAGE = process.env.SCANNER_IMAGE ?? "deltaguard/scanner:latest";

function buildArgs(command: ScanCommand): string[] {
  switch (command.type) {
    case "BIN":
      return ["Bin", "--path", command.path];
    case "CONTAINER":
      return ["Container", "--tar", command.tar];
    case "LICENSE":
      return ["License", "--path", command.path];
    case "VULN":
      return ["Vuln", "--component", command.component, "--version", command.version];
    case "REDHAT":
      return ["Redhat", "--cve", command.cve, "--oval", command.oval];
  }
}

export function runScanner(command: ScanCommand, cwd?: string): Promise<ScanResult> {
  if (SCANNER_MODE === "mock") {
    const text = buildMockOutput(command);
    return Promise.resolve({ stdout: text, stderr: "", code: 0 });
  }
  if (SCANNER_MODE === "docker") {
    // Mount uploads dir into /data inside container
    const uploads = process.env.UPLOADS_DIR ?? "var/uploads";
    const args = [
      "run",
      "--rm",
      "-v",
      `${path.resolve(uploads)}:/data`,
      SCANNER_IMAGE,
      ...buildArgs(mapPathsToContainer(command)),
    ];
    return spawnPromise("docker", args, cwd);
  }

  // Assume local scanner binary named "scanner" is in PATH or project dir
  const localBinary = process.platform === "win32" ? "scanner.exe" : "scanner";
  const candidate = path.resolve(process.cwd(), localBinary);
  const binary = fs.existsSync(candidate) ? candidate : localBinary;
  return spawnPromise(binary, buildArgs(command), cwd);
}

function mapPathsToContainer(command: ScanCommand): ScanCommand {
  // When running in docker, map local var/uploads -> /data
  const toContainerPath = (p: string) => {
    const resolved = path.resolve(p);
    return resolved.replace(path.resolve(process.env.UPLOADS_DIR ?? "var/uploads"), "/data");
  };
  switch (command.type) {
    case "BIN":
      return { type: "BIN", path: toContainerPath(command.path) };
    case "CONTAINER":
      return { type: "CONTAINER", tar: toContainerPath(command.tar) };
    case "LICENSE":
      return { type: "LICENSE", path: toContainerPath(command.path) };
    case "VULN":
      return command; // no file paths
    case "REDHAT":
      return command; // no file paths
  }
}

function spawnPromise(cmd: string, args: string[], cwd?: string): Promise<ScanResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env: process.env });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => resolve({ stdout, stderr, code }));
  });
}

export type NormalizedFinding = {
  id: string; // e.g., CVE-2019-5747
  title?: string;
  description?: string;
  severity?: string;
  source?: string; // e.g., NVD
};

export type NormalizedScan = {
  findings: NormalizedFinding[];
  meta?: Record<string, unknown>;
};

export function parseScannerTextToNormalized(stdout: string): NormalizedScan | null {
  const lines = stdout.split(/\r?\n/);
  const findings: NormalizedFinding[] = [];
  for (const line of lines) {
    // Match lines like: "🔹 CVE-2019-5747: Description..."
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



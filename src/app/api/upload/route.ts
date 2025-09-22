import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { runScanner, parseScannerOutputAuto } from "@/lib/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const packageType = (form.get("packageType") as string) || "BINARY";
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const uploadsDir = process.env.UPLOADS_DIR ?? "var/uploads";
  const storedName = `${Date.now()}_${file.name}`;
  const storedPath = path.join(uploadsDir, storedName);
  await fs.mkdir(uploadsDir, { recursive: true });
  try {
    await fs.writeFile(storedPath, buffer);
  } catch (e: any) {
    console.error("[upload] write failed", e);
    return NextResponse.json({ error: `Failed to write upload: ${String(e?.message || e)}` }, { status: 500 });
  }

  let created: any;
  // Infer type from filename if user did not set correctly
  const nameLower = file.name.toLowerCase();
  const looksLikeContainer = /(\.tar$)|(\.tar\.gz$)|(\.tgz$)|(\.tar\.bz2$)|(\.tbz2$)/.test(nameLower);
  const effectiveType = looksLikeContainer ? "CONTAINER" : packageType;

  try {
    created = await prisma.package.create({
      data: {
        originalName: file.name,
        storedPath,
        mediaType: file.type || "application/octet-stream",
        sizeBytes: buffer.length,
        sha256,
        packageType: effectiveType === "CONTAINER" ? "CONTAINER" : "BINARY",
        status: "UPLOADED",
        scans: {
          create: {
            scanType: effectiveType === "CONTAINER" ? "CONTAINER" : "BIN",
            status: "PENDING",
          },
        },
      },
      include: { scans: true },
    });
  } catch (e: any) {
    console.error("[upload] db create failed", e);
    return NextResponse.json({ error: `Failed to create package: ${String(e?.message || e)}` }, { status: 500 });
  }

  // Fire and forget scan (intentionally not awaited). For simplicity we run inline.
  const scan = created.scans[0];
  void (async () => {
    try {
      await prisma.package.update({ where: { id: created.id }, data: { status: "SCANNING" } });
      await prisma.scan.update({ where: { id: scan.id }, data: { status: "RUNNING", startedAt: new Date() } });
      const cmd = created.packageType === "CONTAINER" ? { type: "CONTAINER" as const, tar: storedPath } : { type: "BIN" as const, path: storedPath };
      // Progress file for SSE tailing (keyed by scan id)
      const progressFilePath = `/tmp/deltaguard/${scan.id}.ndjson`;
      const result = await runScanner(cmd, undefined, { progressFilePath, scanId: scan.id });
      const normalized = parseScannerOutputAuto(result.stdout || result.stderr);
      await prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: result.code === 0 ? "SUCCEEDED" : "FAILED",
          finishedAt: new Date(),
          rawOutput: result.stdout || result.stderr,
          output: normalized as any,
        },
      });
      await prisma.package.update({ where: { id: created.id }, data: { status: result.code === 0 ? "COMPLETED" : "FAILED" } });
      // Append a final summary progress event for UI
      try {
        // Prefer scanner's built JSON summary if available
        let parsed: any = null;
        try { parsed = JSON.parse(result.stdout || result.stderr || ""); } catch { }
        const summary = parsed?.summary ?? (() => {
          const f = (normalized?.findings ?? []) as any[];
          const count = (sev: string) => f.filter((x) => String(x.severity || "").toLowerCase().includes(sev)).length;
          return { total_findings: f.length, critical: count("critical"), high: count("high"), medium: count("medium"), low: count("low") };
        })();
        await fs.appendFile(progressFilePath, JSON.stringify({ stage: "scan.summary", detail: JSON.stringify(summary), ts: new Date().toISOString() }) + "\n");
      } catch { }
      // Optionally remove file after scan if desired
      // await fs.unlink(storedPath).catch(() => {});
    } catch (err) {
      console.error("[upload] scan failed", err);
      await prisma.scan.update({ where: { id: scan.id }, data: { status: "FAILED", error: String(err), finishedAt: new Date() } });
      await prisma.package.update({ where: { id: created.id }, data: { status: "FAILED" } });
      // Append an error summary progress event for UI
      try {
        const progressFilePath = `/tmp/deltaguard/${scan.id}.ndjson`;
        await fs.appendFile(progressFilePath, JSON.stringify({ stage: "scan.summary", detail: JSON.stringify({ error: String(err) }), ts: new Date().toISOString() }) + "\n");
      } catch { }
    }
  })();

  return NextResponse.json({ id: created.id });
}



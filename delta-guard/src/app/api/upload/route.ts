import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { runScanner, parseScannerTextToNormalized } from "@/lib/scanner";
import { memoryDb } from "@/lib/memory";

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
  await fs.writeFile(storedPath, buffer);

  let created: any;
  let usingMemory = false;
  try {
    created = await prisma.package.create({
      data: {
        originalName: file.name,
        storedPath,
        mediaType: file.type || "application/octet-stream",
        sizeBytes: buffer.length,
        sha256,
        packageType: packageType === "CONTAINER" ? "CONTAINER" : "BINARY",
        status: "UPLOADED",
        scans: {
          create: {
            scanType: packageType === "CONTAINER" ? "CONTAINER" : "BIN",
            status: "PENDING",
          },
        },
      },
      include: { scans: true },
    });
  } catch {
    usingMemory = true;
    const id = crypto.randomUUID();
    const scanId = crypto.randomUUID();
    const now = new Date().toISOString();
    const memPkg = {
      id,
      createdAt: now,
      updatedAt: now,
      originalName: file.name,
      storedPath,
      mediaType: file.type || "application/octet-stream",
      sizeBytes: buffer.length,
      sha256,
      packageType: packageType === "CONTAINER" ? "CONTAINER" : "BINARY",
      status: "UPLOADED" as const,
    };
    const memScan = {
      id: scanId,
      createdAt: now,
      updatedAt: now,
      packageId: id,
      scanType: packageType === "CONTAINER" ? "CONTAINER" : "BIN",
      status: "PENDING" as const,
    } as const;
    memoryDb.packages.unshift(memPkg);
    memoryDb.scans.unshift(memScan as any);
    created = { ...memPkg, scans: [memScan] };
  }

  // Fire and forget scan (intentionally not awaited). For simplicity we run inline.
  const scan = created.scans[0];
  void (async () => {
    try {
      if (usingMemory) {
        const idx = memoryDb.packages.findIndex((p) => p.id === created.id);
        if (idx >= 0) memoryDb.packages[idx].status = "SCANNING";
        const sIdx = memoryDb.scans.findIndex((s) => s.id === scan.id);
        if (sIdx >= 0) {
          memoryDb.scans[sIdx].status = "RUNNING";
          memoryDb.scans[sIdx].startedAt = new Date().toISOString();
        }
      } else {
        await prisma.package.update({ where: { id: created.id }, data: { status: "SCANNING" } });
        await prisma.scan.update({ where: { id: scan.id }, data: { status: "RUNNING", startedAt: new Date() } });
      }
      const cmd = created.packageType === "CONTAINER" ? { type: "CONTAINER" as const, tar: storedPath } : { type: "BIN" as const, path: storedPath };
      const result = await runScanner(cmd);
      const normalized = parseScannerTextToNormalized(result.stdout || result.stderr);
      if (usingMemory) {
        const sIdx = memoryDb.scans.findIndex((s) => s.id === scan.id);
        if (sIdx >= 0) {
          memoryDb.scans[sIdx].status = result.code === 0 ? "SUCCEEDED" : "FAILED";
          memoryDb.scans[sIdx].finishedAt = new Date().toISOString();
          memoryDb.scans[sIdx].rawOutput = result.stdout || result.stderr;
          memoryDb.scans[sIdx].output = normalized ?? undefined;
        }
        const pIdx = memoryDb.packages.findIndex((p) => p.id === created.id);
        if (pIdx >= 0) memoryDb.packages[pIdx].status = result.code === 0 ? "COMPLETED" : "FAILED";
      } else {
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
      }
      // Optionally remove file after scan if desired
      // await fs.unlink(storedPath).catch(() => {});
    } catch (err) {
      if (usingMemory) {
        const sIdx = memoryDb.scans.findIndex((s) => s.id === scan.id);
        if (sIdx >= 0) {
          memoryDb.scans[sIdx].status = "FAILED";
          memoryDb.scans[sIdx].finishedAt = new Date().toISOString();
          memoryDb.scans[sIdx].error = String(err);
        }
        const pIdx = memoryDb.packages.findIndex((p) => p.id === created.id);
        if (pIdx >= 0) memoryDb.packages[pIdx].status = "FAILED";
      } else {
        await prisma.scan.update({ where: { id: scan.id }, data: { status: "FAILED", error: String(err), finishedAt: new Date() } });
        await prisma.package.update({ where: { id: created.id }, data: { status: "FAILED" } });
      }
    }
  })();

  return NextResponse.json({ id: created.id });
}



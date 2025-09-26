import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { downloadToFile } from "@/lib/s3";
import { runScanner, parseScannerOutputAuto } from "@/lib/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { key, packageType } = await req.json();
        if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
        const bucket = process.env.MINIO_BUCKET as string;
        if (!bucket) return NextResponse.json({ error: "MINIO_BUCKET not set" }, { status: 500 });

        // Download to local uploads
        const uploadsDir = process.env.UPLOADS_DIR ?? "var/uploads";
        await fs.mkdir(uploadsDir, { recursive: true });
        const base = path.basename(String(key));
        const storedPath = path.join(uploadsDir, base);
        await downloadToFile({ bucket, key: String(key), filePath: storedPath });
        // Confirm file exists and capture size
        let sizeBytes = 0;
        try { const st = await fs.stat(storedPath); sizeBytes = st.size; } catch { }
        if (!sizeBytes) {
            return NextResponse.json({ error: "Downloaded object is empty or missing" }, { status: 500 });
        }

        // Create package + scan and run
        const looksLikeContainer = /\.(tar|tar\.gz|tgz|tar\.bz2|tbz2)$/i.test(base);
        const decidedType = looksLikeContainer ? "CONTAINER" : (String(packageType || "BINARY") === "CONTAINER" ? "CONTAINER" : "BINARY");

        const created = await prisma.package.create({
            data: {
                originalName: base,
                storedPath,
                mediaType: "application/octet-stream",
                sizeBytes,
                sha256: crypto.randomUUID(),
                packageType: decidedType,
                status: "UPLOADED",
                scans: { create: { scanType: decidedType === "CONTAINER" ? "CONTAINER" : "BIN", status: "PENDING" } },
            },
            include: { scans: true },
        });

        const scan = created.scans[0];
        void (async () => {
            const progressDir = process.env.PROGRESS_DIR || "/tmp/deltaguard";
            const progressFilePath = `${progressDir}/${scan.id}.ndjson`;
            try {
                await prisma.package.update({ where: { id: created.id }, data: { status: "SCANNING" } });
                await prisma.scan.update({ where: { id: scan.id }, data: { status: "RUNNING", startedAt: new Date() } });
                const cmd = decidedType === "CONTAINER" ? { type: "CONTAINER" as const, tar: storedPath } : { type: "BIN" as const, path: storedPath };
                const result = await runScanner(cmd, undefined, { progressFilePath, scanId: scan.id });
                const normalized = parseScannerOutputAuto(result.stdout || result.stderr);
                await prisma.scan.update({ where: { id: scan.id }, data: { status: result.code === 0 ? "SUCCEEDED" : "FAILED", finishedAt: new Date(), rawOutput: result.stdout || result.stderr, output: normalized as any } });
                await prisma.package.update({ where: { id: created.id }, data: { status: result.code === 0 ? "COMPLETED" : "FAILED" } });
                try {
                    let parsed: any = null;
                    try { parsed = JSON.parse(result.stdout || result.stderr || ""); } catch { }
                    const summary = parsed?.summary ?? (() => {
                        const f = (normalized?.findings ?? []) as any[];
                        const count = (sev: string) => f.filter((x) => String(x.severity || "").toLowerCase().includes(sev)).length;
                        return { total_findings: f.length, critical: count("critical"), high: count("high"), medium: count("medium"), low: count("low") };
                    })();
                    const fs2 = await import("node:fs/promises");
                    await fs2.appendFile(progressFilePath, JSON.stringify({ stage: "scan.summary", detail: JSON.stringify(summary), ts: new Date().toISOString() }) + "\n");
                } catch { }
            } catch (err) {
                await prisma.scan.update({ where: { id: scan.id }, data: { status: "FAILED", error: String(err), finishedAt: new Date() } });
                await prisma.package.update({ where: { id: created.id }, data: { status: "FAILED" } });
                try {
                    const fs2 = await import("node:fs/promises");
                    await fs2.appendFile(progressFilePath, JSON.stringify({ stage: "scan.summary", detail: JSON.stringify({ error: String(err) }), ts: new Date().toISOString() }) + "\n");
                } catch { }
            }
        })();

        return NextResponse.json({ id: created.id, scanId: scan.id, key });
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}



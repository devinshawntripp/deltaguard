import { NextRequest, NextResponse } from "next/server";
import { S3Client, HeadObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VULNDB_BUCKET = process.env.VULNDB_BUCKET || "vulndb";

// Use public S3 endpoint for presigned URLs (must be reachable from CLI clients)
const accessKeyId = (process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY_ID || "").trim();
const secretAccessKey = (process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_ACCESS_KEY || "").trim();
const region = (process.env.S3_REGION || process.env.MINIO_REGION || "us-east-1").trim();
const publicBase = (process.env.MINIO_PUBLIC_URL || process.env.S3_ENDPOINT || "").trim().replace(/\/$/, "");

const s3 = new S3Client({
  endpoint: publicBase.startsWith("http") ? publicBase : `https://${publicBase}`,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

// Internal client for HeadObject/ListObjects (cluster-internal)
const internalBase = (process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || "").trim().replace(/\/$/, "");
const useSSL = String(process.env.S3_USE_SSL || "true").toLowerCase() === "true";
const s3Internal = new S3Client({
  endpoint: internalBase.startsWith("http") ? internalBase : `${useSSL ? "https" : "http"}://${internalBase}`,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

type PlanTier = "FREE" | "DEVELOPER" | "TEAM" | "ENTERPRISE";
type DbTier = "free" | "full";

const FULL_TIERS: Set<PlanTier> = new Set(["TEAM", "ENTERPRISE"]);

/**
 * Resolve the caller's plan tier from the Authorization header.
 * Returns "FREE" if no key is provided, key is invalid, or revoked.
 */
async function resolvePlanTier(req: NextRequest): Promise<PlanTier> {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return "FREE";

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey) return "FREE";

  const keyHash = hashApiKey(rawKey);

  try {
    const rows = await prisma.$queryRaw<
      { plan_tier: string }[]
    >`SELECT o.plan_tier
      FROM api_keys ak
      JOIN orgs o ON o.id = ak.org_id
      WHERE ak.key_hash = ${keyHash}
        AND ak.revoked = false
      LIMIT 1`;

    if (rows.length === 0) return "FREE";
    return (rows[0].plan_tier || "FREE").toUpperCase() as PlanTier;
  } catch (err) {
    console.error("[api/db/latest] failed to resolve plan tier:", err);
    return "FREE";
  }
}

/**
 * GET /api/db/latest
 *
 * Returns JSON with a presigned S3 URL to download the latest pre-compiled
 * vulnerability database. The CLI's `scanrook db fetch` calls this endpoint.
 *
 * Response: { url, build_date, size, key, tier }
 *
 * The vulndb bucket stores files as:
 *   - scanrook-db-free-YYYY-MM-DD.sqlite.gz  (OSV + basic NVD)
 *   - scanrook-db-YYYY-MM-DD.sqlite.gz        (all sources)
 *
 * The tier determines which DB the caller receives:
 *   - FREE / DEVELOPER / no key → free DB
 *   - TEAM / ENTERPRISE         → full DB
 */
export async function GET(req: NextRequest) {
  // Only allow requests from the scanrook CLI (User-Agent: scanrook-cli/<version>)
  const ua = req.headers.get("user-agent") || "";
  if (!ua.startsWith("scanrook-cli/") && !ua.startsWith("scanrook-db-builder/")) {
    return NextResponse.json(
      { error: "This endpoint is only available to the scanrook CLI. Run `scanrook db fetch`." },
      { status: 403 }
    );
  }

  try {
    const planTier = await resolvePlanTier(req);
    const dbTier: DbTier = FULL_TIERS.has(planTier) ? "full" : "free";

    // List objects in the vulndb bucket
    const listResp = await s3Internal.send(
      new ListObjectsV2Command({
        Bucket: VULNDB_BUCKET,
        Prefix: dbTier === "free" ? "scanrook-db-free-" : "scanrook-db-",
      })
    );

    let objects = (listResp.Contents || [])
      .filter((o) => o.Key?.endsWith(".sqlite.gz") || o.Key?.endsWith(".sqlite"));

    // For full tier, exclude the free DB files (they also match the prefix)
    if (dbTier === "full") {
      objects = objects.filter((o) => !o.Key?.startsWith("scanrook-db-free-"));
    }

    objects.sort((a, b) => (b.Key || "").localeCompare(a.Key || ""));

    if (objects.length === 0) {
      return NextResponse.json(
        { error: "no vulndb available — run the build CronJob first" },
        { status: 404 }
      );
    }

    const latest = objects[0];
    const key = latest.Key!;

    // Extract build date from filename: scanrook-db-[free-]YYYY-MM-DD.sqlite.gz
    const match = key.match(/scanrook-db-(?:free-)?(\d{4}-\d{2}-\d{2})\.sqlite(?:\.gz)?/);
    const buildDate = match ? match[1] : "unknown";

    // Get object size via HeadObject
    const head = await s3Internal.send(
      new HeadObjectCommand({ Bucket: VULNDB_BUCKET, Key: key })
    );

    // Generate presigned GET URL using the PUBLIC endpoint (must be reachable from CLI)
    const presignedUrl = await getSignedUrl(
      s3 as unknown as S3Client,
      new GetObjectCommand({ Bucket: VULNDB_BUCKET, Key: key }),
      { expiresIn: 3600 }
    );

    return NextResponse.json({
      url: presignedUrl,
      build_date: buildDate,
      size: head.ContentLength || 0,
      key,
      tier: dbTier,
    });
  } catch (err: any) {
    console.error("[api/db/latest] error:", err.message || err);
    return NextResponse.json(
      { error: "failed to fetch vulndb metadata" },
      { status: 500 }
    );
  }
}

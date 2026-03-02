import { NextRequest, NextResponse } from "next/server";
import { S3Client, HeadObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

/**
 * GET /api/db/latest
 *
 * Returns JSON with a presigned S3 URL to download the latest pre-compiled
 * vulnerability database. The CLI's `scanrook db fetch` calls this endpoint.
 *
 * Response: { url, build_date, size, key }
 *
 * The vulndb bucket stores files as: scanrook-db-YYYY-MM-DD.sqlite.gz
 * The latest one (by key sort) is returned.
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
    // List objects in the vulndb bucket to find the latest DB file
    const listResp = await s3Internal.send(
      new ListObjectsV2Command({
        Bucket: VULNDB_BUCKET,
        Prefix: "scanrook-db-",
      })
    );

    const objects = (listResp.Contents || [])
      .filter((o) => o.Key?.endsWith(".sqlite.gz") || o.Key?.endsWith(".sqlite"))
      .sort((a, b) => (b.Key || "").localeCompare(a.Key || ""));

    if (objects.length === 0) {
      return NextResponse.json(
        { error: "no vulndb available — run the build CronJob first" },
        { status: 404 }
      );
    }

    const latest = objects[0];
    const key = latest.Key!;

    // Extract build date from filename: scanrook-db-YYYY-MM-DD.sqlite.gz
    const match = key.match(/scanrook-db-(\d{4}-\d{2}-\d{2})\.sqlite(?:\.gz)?/);
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
    });
  } catch (err: any) {
    console.error("[api/db/latest] error:", err.message || err);
    return NextResponse.json(
      { error: "failed to fetch vulndb metadata" },
      { status: 500 }
    );
  }
}

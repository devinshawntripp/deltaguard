import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let s3Cached: S3Client | null = null;

export function getS3(): S3Client | null {
    if (s3Cached) return s3Cached;
    const endpoint = process.env.MINIO_ENDPOINT; // e.g. https://minio.apps.onetripp.com
    const accessKeyId = process.env.MINIO_ACCESS_KEY_ID;
    const secretAccessKey = process.env.MINIO_SECRET_ACCESS_KEY;
    if (!endpoint || !accessKeyId || !secretAccessKey) return null;
    s3Cached = new S3Client({
        endpoint,
        region: process.env.MINIO_REGION || "us-east-1",
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
    });
    return s3Cached;
}

export async function uploadBufferToS3(args: {
    bucket: string;
    key: string;
    buffer: Buffer;
    contentType?: string;
}): Promise<void> {
    const s3 = getS3();
    if (!s3) throw new Error("S3 not configured");
    const cmd = new PutObjectCommand({
        Bucket: args.bucket,
        Key: args.key,
        Body: args.buffer,
        ContentType: args.contentType || "application/octet-stream",
    });
    await s3.send(cmd);
}



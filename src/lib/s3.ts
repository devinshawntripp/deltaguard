import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

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

export async function presignPost(args: { bucket: string; key: string; contentType?: string; expiresSeconds?: number }) {
    const s3 = getS3();
    if (!s3) throw new Error("S3 not configured");
    return createPresignedPost(s3 as any, {
        Bucket: args.bucket,
        Key: args.key,
        Conditions: args.contentType ? [["eq", "$Content-Type", args.contentType]] : undefined,
        Expires: args.expiresSeconds ?? 3600,
    });
}

export async function downloadToFile(args: { bucket: string; key: string; filePath: string }) {
    const s3 = getS3();
    if (!s3) throw new Error("S3 not configured");
    const res = await s3.send(new GetObjectCommand({ Bucket: args.bucket, Key: args.key }));
    const stream = res.Body as any as NodeJS.ReadableStream;
    const fs = await import("node:fs");
    await new Promise<void>((resolve, reject) => {
        const w = fs.createWriteStream(args.filePath);
        stream.pipe(w);
        w.on("finish", () => resolve());
        w.on("error", reject);
    });
}



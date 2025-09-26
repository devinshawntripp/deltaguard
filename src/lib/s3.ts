import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const accessKeyId = (process.env.MINIO_ACCESS_KEY_ID ?? '').trim();
const secretAccessKey = (process.env.MINIO_SECRET_ACCESS_KEY ?? '').trim();
const region = process.env.MINIO_REGION || "us-east-1";

// External/public endpoint for browser uploads (HTTPS)
export const s3Public = new S3Client({
    endpoint: (process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT || '').trim().replace(/\/$/, ''),
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
});

// Internal/cluster endpoint for server-side gets/puts
export const s3Internal = new S3Client({
    endpoint: (process.env.MINIO_INTERNAL_ENDPOINT || process.env.MINIO_ENDPOINT || '').trim().replace(/\/$/, ''),
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
});

export async function uploadBufferToS3(args: {
    bucket: string;
    key: string;
    buffer: Buffer;
    contentType?: string;
}): Promise<void> {
    const s3 = s3Internal;
    const cmd = new PutObjectCommand({
        Bucket: args.bucket,
        Key: args.key,
        Body: args.buffer,
        ContentType: args.contentType || "application/octet-stream",
    });
    await s3.send(cmd);
}

export async function presignPost(args: { bucket: string; key: string; contentType?: string; expiresSeconds?: number }) {
    const { url, fields } = await createPresignedPost(s3Public as unknown as S3Client, {
        Bucket: args.bucket,
        Key: args.key,
        Conditions: args.contentType ? [["eq", "$Content-Type", args.contentType]] : undefined,
        Expires: args.expiresSeconds ?? 3600,
    });
    // Some MinIO setups include url; otherwise synthesize from public base
    const publicBase = (process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT || '').trim().replace(/\/$/, '');
    const action = url || `${publicBase}/${args.bucket}`;
    return { action, fields, url: action };
}

export async function downloadToFile(args: { bucket: string; key: string; filePath: string }) {
    const res = await s3Internal.send(new GetObjectCommand({ Bucket: args.bucket, Key: args.key }));
    const stream = res.Body as unknown as NodeJS.ReadableStream;
    const fs = await import("node:fs");
    await new Promise<void>((resolve, reject) => {
        const w = fs.createWriteStream(args.filePath);
        stream.pipe(w);
        w.on("finish", () => resolve());
        w.on("error", reject);
    });
}



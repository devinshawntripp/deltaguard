import { S3Client, PutObjectCommand, GetObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Support both legacy MINIO_* and new S3_* envs
const accessKeyId = (process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY_ID || '').trim();
const secretAccessKey = (process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_ACCESS_KEY || '').trim();
const region = (process.env.S3_REGION || process.env.MINIO_REGION || "us-east-1").trim();
const useSSL = String(process.env.S3_USE_SSL || 'true').toLowerCase() === 'true';
const endpointBase = (process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || '').trim().replace(/\/$/, '');
const publicBase = (process.env.MINIO_PUBLIC_URL || endpointBase).replace(/\/$/, '');

// External/public endpoint for browser uploads (HTTPS)
export const s3Public = new S3Client({
    endpoint: publicBase.startsWith('http') ? publicBase : `${useSSL ? 'https' : 'http'}://${publicBase}`,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
});

// Internal/cluster endpoint for server-side gets/puts
export const s3Internal = new S3Client({
    endpoint: endpointBase.startsWith('http') ? endpointBase : `${useSSL ? 'https' : 'http'}://${endpointBase}`,
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
    const action = url || `${publicBase}/${args.bucket}`;
    return { action, fields, url: action };
}

export async function presignPut(args: { bucket: string; key: string; contentType?: string; expiresSeconds?: number }) {
    const input: PutObjectCommandInput = {
        Bucket: args.bucket,
        Key: args.key,
        ContentType: args.contentType || "application/octet-stream",
    };
    const url = await getSignedUrl(s3Public as unknown as S3Client, new PutObjectCommand(input), { expiresIn: args.expiresSeconds ?? 3600 });
    return { url, method: "PUT" as const, headers: { "Content-Type": input.ContentType! } };
}

export async function presignGet(args: { bucket: string; key: string; expiresSeconds?: number }) {
    const url = await getSignedUrl(s3Internal as unknown as S3Client, new GetObjectCommand({ Bucket: args.bucket, Key: args.key }), { expiresIn: args.expiresSeconds ?? 3600 });
    return { url, method: "GET" as const };
}

export async function deleteObject(args: { bucket: string; key: string }) {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    await s3Internal.send(new DeleteObjectCommand({ Bucket: args.bucket, Key: args.key }));
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



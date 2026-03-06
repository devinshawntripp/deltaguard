import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
    const key = process.env.REGISTRY_ENCRYPTION_KEY;
    if (!key) {
        throw new Error("REGISTRY_ENCRYPTION_KEY env var not set");
    }
    const buf = Buffer.from(key, "hex");
    if (buf.length !== 32) {
        throw new Error("REGISTRY_ENCRYPTION_KEY must be 64 hex chars (32 bytes)");
    }
    return buf;
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns a buffer of: IV (12 bytes) || ciphertext || auth tag (16 bytes).
 */
export function encrypt(plaintext: string): Buffer {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, encrypted, tag]);
}

/**
 * Decrypt a buffer produced by encrypt().
 */
export function decrypt(data: Buffer): string {
    const key = getEncryptionKey();
    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(data.length - TAG_LENGTH);
    const ciphertext = data.subarray(IV_LENGTH, data.length - TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(ciphertext) + decipher.final("utf8");
}

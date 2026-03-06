import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";

export type RegistryConfig = {
    id: string;
    orgId: string;
    name: string;
    registryUrl: string;
    username: string | null;
    hasToken: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type RegistryRow = {
    id: string;
    org_id: string;
    name: string;
    registry_url: string;
    username: string | null;
    token_encrypted: Buffer | null;
    created_at: Date;
    updated_at: Date;
};

function rowToConfig(row: RegistryRow): RegistryConfig {
    return {
        id: row.id,
        orgId: row.org_id,
        name: row.name,
        registryUrl: row.registry_url,
        username: row.username,
        hasToken: row.token_encrypted !== null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function listOrgRegistries(orgId: string): Promise<RegistryConfig[]> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<RegistryRow[]>`
        SELECT id::text, org_id::text, name, registry_url, username, token_encrypted, created_at, updated_at
        FROM registry_configs
        WHERE org_id = ${orgId}::uuid
        ORDER BY name
    `;
    return rows.map(rowToConfig);
}

export async function getRegistryConfig(id: string, orgId: string): Promise<RegistryConfig | null> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<RegistryRow[]>`
        SELECT id::text, org_id::text, name, registry_url, username, token_encrypted, created_at, updated_at
        FROM registry_configs
        WHERE id = ${id}::uuid AND org_id = ${orgId}::uuid
        LIMIT 1
    `;
    return rows[0] ? rowToConfig(rows[0]) : null;
}

export type CreateRegistryParams = {
    orgId: string;
    name: string;
    registryUrl: string;
    username?: string;
    token?: string;
};

export async function createRegistryConfig(params: CreateRegistryParams): Promise<RegistryConfig> {
    await ensurePlatformSchema();
    const tokenEncrypted = params.token ? encrypt(params.token) : null;
    const rows = await prisma.$queryRaw<RegistryRow[]>`
        INSERT INTO registry_configs (org_id, name, registry_url, username, token_encrypted)
        VALUES (${params.orgId}::uuid, ${params.name}, ${params.registryUrl}, ${params.username ?? null}, ${tokenEncrypted})
        RETURNING id::text, org_id::text, name, registry_url, username, token_encrypted, created_at, updated_at
    `;
    return rowToConfig(rows[0]);
}

export type UpdateRegistryParams = {
    id: string;
    orgId: string;
    name?: string;
    registryUrl?: string;
    username?: string | null;
    token?: string | null;
};

export async function updateRegistryConfig(params: UpdateRegistryParams): Promise<RegistryConfig | null> {
    await ensurePlatformSchema();
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 3; // $1 = id, $2 = org_id

    if (params.name !== undefined) {
        sets.push(`name = $${idx}`);
        values.push(params.name);
        idx++;
    }
    if (params.registryUrl !== undefined) {
        sets.push(`registry_url = $${idx}`);
        values.push(params.registryUrl);
        idx++;
    }
    if (params.username !== undefined) {
        sets.push(`username = $${idx}`);
        values.push(params.username);
        idx++;
    }
    if (params.token !== undefined) {
        sets.push(`token_encrypted = $${idx}`);
        values.push(params.token ? encrypt(params.token) : null);
        idx++;
    }

    if (sets.length === 0) {
        return getRegistryConfig(params.id, params.orgId);
    }

    sets.push("updated_at = now()");

    const sql = `UPDATE registry_configs SET ${sets.join(", ")} WHERE id = $1::uuid AND org_id = $2::uuid RETURNING id::text, org_id::text, name, registry_url, username, token_encrypted, created_at, updated_at`;
    const rows = await prisma.$queryRawUnsafe<RegistryRow[]>(sql, params.id, params.orgId, ...values);
    return rows[0] ? rowToConfig(rows[0]) : null;
}

export async function deleteRegistryConfig(id: string, orgId: string): Promise<boolean> {
    await ensurePlatformSchema();
    const result = await prisma.$executeRaw`
        DELETE FROM registry_configs WHERE id = ${id}::uuid AND org_id = ${orgId}::uuid
    `;
    return result > 0;
}

/**
 * Get decrypted credentials for a registry config. Used by browse proxy.
 */
export async function getRegistryCredentials(id: string, orgId: string): Promise<{
    registryUrl: string;
    username: string | null;
    token: string | null;
} | null> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<RegistryRow[]>`
        SELECT id::text, org_id::text, name, registry_url, username, token_encrypted, created_at, updated_at
        FROM registry_configs
        WHERE id = ${id}::uuid AND org_id = ${orgId}::uuid
        LIMIT 1
    `;
    if (!rows[0]) return null;
    const row = rows[0];
    return {
        registryUrl: row.registry_url,
        username: row.username,
        token: row.token_encrypted ? decrypt(row.token_encrypted) : null,
    };
}

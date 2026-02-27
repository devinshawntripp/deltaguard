export const ROLE_VIEWER = BigInt(1);
export const ROLE_ANALYST = BigInt(2);
export const ROLE_OPERATOR = BigInt(4);
export const ROLE_SCAN_ADMIN = BigInt(8);
export const ROLE_POLICY_ADMIN = BigInt(16);
export const ROLE_BILLING_ADMIN = BigInt(32);
export const ROLE_API_KEY_ADMIN = BigInt(64);
export const ROLE_ORG_OWNER = BigInt(128);

export const ADMIN_OVERRIDE = BigInt("9223372036854775807");

export type RoleMaskInput = string | number | bigint | null | undefined;

export function parseRoleMask(value: RoleMaskInput, fallback: bigint = ROLE_VIEWER): bigint {
    if (typeof value === "bigint") return value;
    if (typeof value === "number") {
        if (!Number.isFinite(value)) return fallback;
        return BigInt(Math.trunc(value));
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return fallback;
        try {
            return BigInt(trimmed);
        } catch {
            return fallback;
        }
    }
    return fallback;
}

export function isAdminOverride(mask: bigint): boolean {
    return mask === ADMIN_OVERRIDE;
}

export function hasRole(mask: bigint, required: bigint): boolean {
    if (isAdminOverride(mask)) return true;
    return (mask & required) === required;
}

export function hasAnyRole(mask: bigint, required: bigint[]): boolean {
    if (isAdminOverride(mask)) return true;
    return required.some((role) => hasRole(mask, role));
}

export function normalizeRolesMask(mask: bigint): bigint {
    if (mask < BigInt(0)) return ROLE_VIEWER;
    return mask;
}

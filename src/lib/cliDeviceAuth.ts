import crypto from "node:crypto";
import { getRedis } from "@/lib/redis";

const DEVICE_TTL_SECONDS = 10 * 60;
const DEVICE_STATE_PREFIX = "cli:device:state:";
const DEVICE_GRANT_PREFIX = "cli:device:grant:";

type DeviceState = {
    status: "pending" | "authorized";
    user_code: string;
    created_at: string;
    org_id?: string;
    roles_mask?: string;
};

type DeviceGrant = {
    token: string;
    org_id: string;
    roles_mask: string;
    issued_at: string;
};

function deviceStateKey(code: string): string {
    return `${DEVICE_STATE_PREFIX}${code}`;
}

function deviceGrantKey(code: string): string {
    return `${DEVICE_GRANT_PREFIX}${code}`;
}

function randomDeviceCode(): string {
    return crypto.randomBytes(24).toString("base64url");
}

function randomUserCode(): string {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase();
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}`;
}

export async function createDeviceAuthorizationRequest(): Promise<{
    deviceCode: string;
    userCode: string;
    expiresIn: number;
    intervalSeconds: number;
}> {
    const redis = getRedis();
    if (!redis) {
        throw new Error("redis unavailable");
    }
    if (redis.status === "wait") {
        await redis.connect();
    }

    const deviceCode = randomDeviceCode();
    const userCode = randomUserCode();
    const state: DeviceState = {
        status: "pending",
        user_code: userCode,
        created_at: new Date().toISOString(),
    };
    await redis.set(deviceStateKey(deviceCode), JSON.stringify(state), "EX", DEVICE_TTL_SECONDS);
    return {
        deviceCode,
        userCode,
        expiresIn: DEVICE_TTL_SECONDS,
        intervalSeconds: 5,
    };
}

export async function authorizeDeviceCode(
    deviceCode: string,
    token: string,
    orgId: string,
    rolesMask: string,
): Promise<"not_found" | "ok"> {
    const redis = getRedis();
    if (!redis) {
        throw new Error("redis unavailable");
    }
    if (redis.status === "wait") {
        await redis.connect();
    }

    const stateRaw = await redis.get(deviceStateKey(deviceCode));
    if (!stateRaw) return "not_found";

    const state = JSON.parse(stateRaw) as DeviceState;
    const nextState: DeviceState = {
        ...state,
        status: "authorized",
        org_id: orgId,
        roles_mask: rolesMask,
    };
    const grant: DeviceGrant = {
        token,
        org_id: orgId,
        roles_mask: rolesMask,
        issued_at: new Date().toISOString(),
    };
    const tx = redis.multi();
    tx.set(deviceStateKey(deviceCode), JSON.stringify(nextState), "EX", DEVICE_TTL_SECONDS);
    tx.set(deviceGrantKey(deviceCode), JSON.stringify(grant), "EX", DEVICE_TTL_SECONDS);
    await tx.exec();
    return "ok";
}

export async function consumeDeviceGrant(deviceCode: string): Promise<
    | { status: "authorized"; api_key: string; org_id: string; roles_mask: string }
    | { status: "pending" }
    | { status: "expired_or_invalid" }
> {
    const redis = getRedis();
    if (!redis) {
        throw new Error("redis unavailable");
    }
    if (redis.status === "wait") {
        await redis.connect();
    }

    const grantRaw = await redis.get(deviceGrantKey(deviceCode));
    if (grantRaw) {
        const grant = JSON.parse(grantRaw) as DeviceGrant;
        const tx = redis.multi();
        tx.del(deviceGrantKey(deviceCode));
        tx.del(deviceStateKey(deviceCode));
        await tx.exec();
        return {
            status: "authorized",
            api_key: grant.token,
            org_id: grant.org_id,
            roles_mask: grant.roles_mask,
        };
    }

    const stateRaw = await redis.get(deviceStateKey(deviceCode));
    if (!stateRaw) return { status: "expired_or_invalid" };
    return { status: "pending" };
}

import { NextRequest, NextResponse } from "next/server";
import { createDeviceAuthorizationRequest } from "@/lib/cliDeviceAuth";
import { inferBaseUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const result = await createDeviceAuthorizationRequest();
        const base = inferBaseUrl(req);
        return NextResponse.json(
            {
                device_code: result.deviceCode,
                user_code: result.userCode,
                verification_uri: `${base}/dashboard/settings/api-keys`,
                verification_uri_complete: `${base}/dashboard/settings/api-keys?device_code=${encodeURIComponent(
                    result.deviceCode,
                )}&user_code=${encodeURIComponent(result.userCode)}`,
                expires_in: result.expiresIn,
                interval: result.intervalSeconds,
                message:
                    "Approve this device code with an API key by calling /api/cli/auth/device/complete with approve=true.",
            },
            { status: 200 },
        );
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg, code: "device_start_failed" }, { status: 503 });
    }
}

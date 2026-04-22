import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ROLE_OPERATOR } from "@/lib/roles";
import { getRegistryConfig } from "@/lib/registries";
import { createRegistryJob } from "@/lib/jobs";
import { canQueueScan, incrementUsage } from "@/lib/usage";
import { getScannerSettings } from "@/lib/scannerSettings";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCAN_ROLES = [ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: SCAN_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "scan registry image",
    });
    if ("response" in guard) return guard.response;

    try {
        const body = await req.json();
        const registryConfigId = String(body?.registry_config_id || "").trim();
        const directImage = String(body?.image || "").trim();
        const repo = String(body?.repo || "").trim();
        const tag = String(body?.tag || "").trim();

        const isAdmin = guard.actor.rolesMask === ADMIN_OVERRIDE;
        const quota = await canQueueScan(guard.actor.orgId);
        if (!quota.allowed && !isAdmin) {
            return NextResponse.json(
                { error: "Monthly scan limit reached", code: "quota_exceeded", usage: quota.usage },
                { status: 402 },
            );
        }

        let registryImage: string;

        if (directImage) {
            // Public image scan — no registry config needed
            // Validate image ref format (must have at least a name)
            if (!/^[a-zA-Z0-9][a-zA-Z0-9._\-/]*(?::[a-zA-Z0-9._\-]+)?$/.test(directImage)) {
                return NextResponse.json({ error: "Invalid image reference" }, { status: 400 });
            }
            registryImage = directImage;
        } else {
            // Private registry scan — requires config
            if (!registryConfigId) return NextResponse.json({ error: "registry_config_id or image required" }, { status: 400 });
            if (!repo) return NextResponse.json({ error: "repo required" }, { status: 400 });
            if (!tag) return NextResponse.json({ error: "tag required" }, { status: 400 });

            const registry = await getRegistryConfig(registryConfigId, guard.actor.orgId);
            if (!registry) return NextResponse.json({ error: "registry not found" }, { status: 404 });

            const registryHost = registry.registryUrl
                .replace(/^https?:\/\//, "")
                .replace(/\/+$/, "");
            registryImage = `${registryHost}/${repo}:${tag}`;
        }

        const settings = await getScannerSettings(guard.actor.orgId);

        const job = await createRegistryJob({
            registry_config_id: registryConfigId || null,
            registry_image: registryImage,
            org_id: guard.actor.orgId,
            created_by_user_id: guard.actor.userId || null,
            created_by_api_key_id: guard.actor.apiKeyId || null,
            settings_snapshot: settings,
        });

        await incrementUsage(guard.actor.orgId, guard.actor.kind === "api_key" ? "api" : "ui");
        audit({ actor: guard.actor, action: "scan.created", targetType: "scan_job", targetId: job.id, detail: `Registry scan for ${registryImage}`, ip: getClientIp(req) });
        return NextResponse.json(job);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}

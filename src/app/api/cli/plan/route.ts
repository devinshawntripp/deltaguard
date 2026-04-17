import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PlanEnrichment {
    osv: boolean;
    nvd: boolean;
    oval: boolean;
    epss: boolean;
    kev: boolean;
    distro_trackers: boolean;
}

interface PlanInfo {
    tier: string;
    enrichment: PlanEnrichment;
    output_formats: string[];
    db_tier: string;
}

const FREE_PLAN: PlanInfo = {
    tier: "free",
    enrichment: { osv: true, nvd: false, oval: false, epss: false, kev: false, distro_trackers: false },
    output_formats: ["text"],
    db_tier: "free",
};

const DEVELOPER_PLAN: PlanInfo = {
    tier: "developer",
    enrichment: { osv: true, nvd: true, oval: false, epss: true, kev: true, distro_trackers: false },
    output_formats: ["text", "json", "ndjson"],
    db_tier: "free",
};

const TEAM_PLAN: PlanInfo = {
    tier: "team",
    enrichment: { osv: true, nvd: true, oval: true, epss: true, kev: true, distro_trackers: true },
    output_formats: ["text", "json", "ndjson"],
    db_tier: "full",
};

const ENTERPRISE_PLAN: PlanInfo = {
    tier: "enterprise",
    enrichment: { osv: true, nvd: true, oval: true, epss: true, kev: true, distro_trackers: true },
    output_formats: ["text", "json", "ndjson"],
    db_tier: "full",
};

function planForTier(tier: string): PlanInfo {
    switch (tier.toLowerCase()) {
        case "developer":
        case "basic":
            return DEVELOPER_PLAN;
        case "team":
        case "pro":
            return TEAM_PLAN;
        case "enterprise":
            return ENTERPRISE_PLAN;
        default:
            return FREE_PLAN;
    }
}

export async function GET(req: NextRequest) {
    const actor = await resolveRequestActor(req, { allowAnonymous: false });

    if (!actor) {
        // No valid auth — check if they tried to authenticate
        const authHeader = req.headers.get("authorization") || "";
        if (authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
        }
        // No auth at all — return free tier defaults
        return NextResponse.json(FREE_PLAN, { status: 200 });
    }

    // Look up org plan tier
    const rows = await prisma.$queryRaw<{ plan_tier: string }[]>`
        SELECT plan_tier FROM orgs WHERE id = ${actor.orgId}::uuid LIMIT 1
    `;

    const tier = rows[0]?.plan_tier ?? "FREE";
    return NextResponse.json(planForTier(tier), { status: 200 });
}

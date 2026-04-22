import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_VIEWER, ROLE_ANALYST, ROLE_OPERATOR, ROLE_POLICY_ADMIN, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import { evaluatePolicy, PolicyRule, PolicyResult } from "@/lib/policyEngine";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVAL_ROLES = [ROLE_VIEWER, ROLE_ANALYST, ROLE_OPERATOR, ROLE_POLICY_ADMIN, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: EVAL_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "evaluate scan policies",
    });
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const jobId = String(body?.job_id || "").trim();
    if (!jobId) {
        return NextResponse.json({ error: "job_id is required" }, { status: 400 });
    }

    await ensurePlatformSchema();

    // Fetch the scan job summary
    const jobRows = await prisma.$queryRaw<any[]>`
        SELECT id, summary_json, created_at, finished_at
        FROM scan_jobs
        WHERE id = ${jobId}::uuid AND org_id = ${guard.actor.orgId}::uuid
        LIMIT 1
    `;
    if (jobRows.length === 0) {
        return NextResponse.json({ error: "Scan job not found" }, { status: 404 });
    }
    const job = jobRows[0];
    const summaryJson = job.summary_json || {};

    // Enrich with timestamps for min_scan_age rule
    const scanSummary = {
        ...summaryJson,
        created_at: job.created_at,
        finished_at: job.finished_at,
    };

    // Fetch all enabled policies for this org
    const policies = await prisma.$queryRaw<any[]>`
        SELECT id, name, rules
        FROM scan_policies
        WHERE org_id = ${guard.actor.orgId}::uuid AND enabled = true
        ORDER BY created_at
    `;

    const results: PolicyResult[] = policies.map((policy) => {
        const rules: PolicyRule[] = Array.isArray(policy.rules) ? policy.rules : [];
        const { failures, warnings } = evaluatePolicy(rules, scanSummary);
        return {
            policy_id: policy.id,
            policy_name: policy.name,
            passed: failures.length === 0,
            rules_evaluated: rules.length,
            failures,
            warnings,
        };
    });

    const allPassed = results.every((r) => r.passed);

    audit({ actor: guard.actor, action: "policy.evaluated", targetType: "scan_job", targetId: jobId, detail: `${results.length} policies evaluated, ${allPassed ? "all passed" : "failures detected"}`, ip: getClientIp(req) });
    return NextResponse.json({
        job_id: jobId,
        all_passed: allPassed,
        policies_evaluated: results.length,
        results,
    });
}

import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import { getOrgPlanUsage } from "@/lib/usage";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getActiveContributors } from "@/lib/contributors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const usage = await getOrgPlanUsage(actor.orgId);
        let billing = null;
        try {
            const rows = await prisma.$queryRaw<Array<{
                status: string | null;
                stripe_customer_id: string | null;
                stripe_subscription_id: string | null;
                current_period_start: string | null;
                current_period_end: string | null;
            }>>`
SELECT
  status,
  stripe_customer_id,
  stripe_subscription_id,
  CASE WHEN current_period_start IS NULL THEN NULL ELSE current_period_start::text END AS current_period_start,
  CASE WHEN current_period_end IS NULL THEN NULL ELSE current_period_end::text END AS current_period_end
FROM org_billing
WHERE org_id=${actor.orgId}::uuid
LIMIT 1
            `;
            billing = rows[0] || null;
        } catch {
            // org_billing table may not exist yet — that's OK
        }

        const contributors = await getActiveContributors(actor.orgId, 90);

        // Fetch seat limit from orgs table
        const seatRows = await prisma.$queryRaw<Array<{ plan_seats: number }>>`
          SELECT plan_seats FROM orgs WHERE id = ${actor.orgId}::uuid LIMIT 1
        `;
        const planSeats = seatRows[0]?.plan_seats ?? 1;

        return NextResponse.json({
            usage,
            billing,
            activeContributors: contributors.count,
            contributors: contributors.contributors,
            planSeats,
            features: {
                stripeEnabled: Boolean(getStripe()),
            },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[billing/status] Error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_BILLING_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { getStripe } from "@/lib/stripe";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BILLING_ROLES = [ROLE_BILLING_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: BILLING_ROLES,
        requiredKinds: ["user"],
        feature: "open billing portal",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const stripe = getStripe();
    if (!stripe) {
        return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
    }

    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ stripe_customer_id: string | null }>>`
SELECT stripe_customer_id
FROM org_billing
WHERE org_id=${actor.orgId}::uuid
LIMIT 1
    `;
    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) {
        return NextResponse.json({ error: "No billing customer found" }, { status: 404 });
    }

    const baseUrl = (process.env.APP_BASE_URL || req.nextUrl.origin).replace(/\/$/, "");
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
}

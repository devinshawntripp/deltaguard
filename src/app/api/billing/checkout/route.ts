import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_BILLING_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { getStripe, stripePriceIdForPlan, canonicalPlanTier, minSeatsForPlan } from "@/lib/stripe";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BILLING_ROLES = [ROLE_BILLING_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: BILLING_ROLES,
        requiredKinds: ["user"],
        feature: "start billing checkout",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const stripe = getStripe();
    if (!stripe) {
        return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
    }

    try {
        await ensurePlatformSchema();
        const body = await req.json();
        // Accept both legacy (BASIC/PRO/ENTERPRISE) and new (DEVELOPER/TEAM) plan names
        const rawPlan = String(body?.plan_code || body?.plan || "").toUpperCase();
        if (!["BASIC", "PRO", "ENTERPRISE", "DEVELOPER", "TEAM"].includes(rawPlan)) {
            return NextResponse.json({ error: "plan_code must be DEVELOPER, TEAM, BASIC, PRO, or ENTERPRISE" }, { status: 400 });
        }

        const planCode = canonicalPlanTier(rawPlan); // normalize DEVELOPER→BASIC, TEAM→PRO

        const priceId = stripePriceIdForPlan(rawPlan);
        if (!priceId) {
            return NextResponse.json({ error: `Stripe price is not configured for ${rawPlan}` }, { status: 500 });
        }

        // Determine quantity (seats). TEAM/PRO plans support multiple seats (min 5).
        const minSeats = minSeatsForPlan(rawPlan);
        const requestedSeats = Number(body?.seats) || minSeats;
        const quantity = Math.max(requestedSeats, minSeats);

        const orgRows = await prisma.$queryRaw<Array<{ name: string; stripe_customer_id: string | null }>>`
SELECT o.name, ob.stripe_customer_id
FROM orgs o
LEFT JOIN org_billing ob ON ob.org_id=o.id
WHERE o.id=${actor.orgId}::uuid
LIMIT 1
        `;
        const org = orgRows[0];
        if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

        let customerId = org.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                name: org.name,
                email: actor.email,
                metadata: { org_id: actor.orgId },
            });
            customerId = customer.id;
        }

        const baseUrl = (process.env.APP_BASE_URL || req.nextUrl.origin).replace(/\/$/, "");
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: customerId,
            line_items: [{ price: priceId, quantity }],
            success_url: `${baseUrl}/dashboard/settings/billing?success=true`,
            cancel_url: `${baseUrl}/dashboard/settings/billing?canceled=true`,
            metadata: {
                org_id: actor.orgId,
                plan_code: planCode,
            },
        });

        await prisma.$executeRaw`
INSERT INTO org_billing (org_id, stripe_customer_id, status, updated_at)
VALUES (${actor.orgId}::uuid, ${customerId}, 'pending', now())
ON CONFLICT (org_id)
DO UPDATE SET stripe_customer_id=EXCLUDED.stripe_customer_id, status='pending', updated_at=now()
        `;

        return NextResponse.json({ url: session.url });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

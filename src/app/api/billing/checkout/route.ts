import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_BILLING_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { getStripe, stripePriceIdForPlan } from "@/lib/stripe";
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
        const planCode = String(body?.plan_code || "").toUpperCase();
        if (!["BASIC", "PRO", "ENTERPRISE"].includes(planCode)) {
            return NextResponse.json({ error: "plan_code must be BASIC, PRO, or ENTERPRISE" }, { status: 400 });
        }

        const priceId = stripePriceIdForPlan(planCode);
        if (!priceId) {
            return NextResponse.json({ error: `Stripe price is not configured for ${planCode}` }, { status: 500 });
        }

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
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${baseUrl}/dashboard/settings/billing?success=1`,
            cancel_url: `${baseUrl}/dashboard/settings/billing?canceled=1`,
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

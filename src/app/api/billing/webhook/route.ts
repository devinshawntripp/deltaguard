import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function planIdByCode(planCode: string): Promise<string | null> {
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
SELECT id::text AS id
FROM plans
WHERE code=${planCode}
LIMIT 1
    `;
    return rows[0]?.id || null;
}

async function updateOrgBillingFromSubscription(sub: Stripe.Subscription, orgId: string, fallbackPlanCode?: string | null) {
    await ensurePlatformSchema();
    const planCode = fallbackPlanCode || (sub.items.data[0]?.price?.nickname || "").toUpperCase() || "FREE";
    const planId = await planIdByCode(planCode);

    const periodStartUnix = Number((sub as any).current_period_start || 0);
    const periodEndUnix = Number((sub as any).current_period_end || 0);
    const periodStart = periodStartUnix > 0 ? new Date(periodStartUnix * 1000).toISOString() : null;
    const periodEnd = periodEndUnix > 0 ? new Date(periodEndUnix * 1000).toISOString() : null;

    await prisma.$executeRaw`
INSERT INTO org_billing (
  org_id,
  plan_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  current_period_start,
  current_period_end,
  updated_at
)
VALUES (
  ${orgId}::uuid,
  ${planId || null}::uuid,
  ${String(sub.customer || "")},
  ${sub.id},
  ${sub.status},
  ${periodStart || null}::timestamptz,
  ${periodEnd || null}::timestamptz,
  now()
)
ON CONFLICT (org_id)
DO UPDATE SET
  plan_id = EXCLUDED.plan_id,
  stripe_customer_id = EXCLUDED.stripe_customer_id,
  stripe_subscription_id = EXCLUDED.stripe_subscription_id,
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  updated_at = now()
    `;
}

export async function POST(req: NextRequest) {
    const stripe = getStripe();
    if (!stripe) {
        return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
    }

    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
    if (!webhookSecret) {
        return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 500 });
    }

    const sig = req.headers.get("stripe-signature") || "";
    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: `Webhook signature error: ${msg}` }, { status: 400 });
    }

    try {
        await ensurePlatformSchema();
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const orgId = String(session.metadata?.org_id || "");
                const planCode = String(session.metadata?.plan_code || "").toUpperCase();
                if (orgId && session.subscription) {
                    const sub = await stripe.subscriptions.retrieve(String(session.subscription));
                    await updateOrgBillingFromSubscription(sub, orgId, planCode || null);
                }
                break;
            }
            case "customer.subscription.updated":
            case "customer.subscription.created": {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = String(sub.customer || "");
                if (!customerId) break;

                const rows = await prisma.$queryRaw<Array<{ org_id: string }>>`
SELECT org_id::text AS org_id
FROM org_billing
WHERE stripe_customer_id=${customerId}
LIMIT 1
                `;
                const orgId = rows[0]?.org_id;
                if (orgId) {
                    await updateOrgBillingFromSubscription(sub, orgId);
                }
                break;
            }
            case "customer.subscription.deleted": {
                // Downgrade to FREE and clear subscription ID
                const sub = event.data.object as Stripe.Subscription;
                const customerId = String(sub.customer || "");
                if (!customerId) break;

                const rows = await prisma.$queryRaw<Array<{ org_id: string }>>`
SELECT org_id::text AS org_id
FROM org_billing
WHERE stripe_customer_id=${customerId}
LIMIT 1
                `;
                const orgId = rows[0]?.org_id;
                if (orgId) {
                    const freePlanId = await planIdByCode("FREE");
                    await prisma.$executeRaw`
UPDATE org_billing
SET plan_id = ${freePlanId || null}::uuid,
    stripe_subscription_id = NULL,
    status = 'canceled',
    current_period_end = NULL,
    updated_at = now()
WHERE org_id = ${orgId}::uuid
                    `;
                    audit({ actor: null, action: "billing.plan_cancelled", targetType: "org_billing", detail: `Subscription cancelled for org ${orgId}`, metadata: { org_id: orgId, customer_id: customerId } });
                }
                break;
            }
            default:
                break;
        }
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

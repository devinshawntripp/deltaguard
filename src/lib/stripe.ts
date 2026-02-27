import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
    if (stripe) return stripe;
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!key) return null;
    stripe = new Stripe(key);
    return stripe;
}

export function stripePriceIdForPlan(planCode: string): string {
    const normalized = String(planCode || "").toUpperCase();
    if (normalized === "BASIC") return String(process.env.STRIPE_PRICE_BASIC || "");
    if (normalized === "PRO") return String(process.env.STRIPE_PRICE_PRO || "");
    if (normalized === "ENTERPRISE") return String(process.env.STRIPE_PRICE_ENTERPRISE || "");
    return "";
}

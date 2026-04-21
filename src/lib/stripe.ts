import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
    if (stripe) return stripe;
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!key) return null;
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (proxy) {
        // Stripe SDK accepts httpAgent for proxy tunneling
        const { HttpsProxyAgent } = require("https-proxy-agent");
        const agent = new HttpsProxyAgent(proxy);
        stripe = new Stripe(key, { httpAgent: agent });
    } else {
        stripe = new Stripe(key);
    }
    return stripe;
}

export function stripePriceIdForPlan(planCode: string): string {
    const normalized = String(planCode || "").toUpperCase();
    if (normalized === "BASIC" || normalized === "DEVELOPER")
        return String(process.env.STRIPE_PRICE_DEVELOPER || process.env.STRIPE_PRICE_BASIC || "");
    if (normalized === "PRO" || normalized === "TEAM")
        return String(process.env.STRIPE_PRICE_TEAM || process.env.STRIPE_PRICE_PRO || "");
    if (normalized === "ENTERPRISE") return String(process.env.STRIPE_PRICE_ENTERPRISE || "");
    return "";
}

/** Map plan aliases to canonical tier names stored in the DB */
export function canonicalPlanTier(planCode: string): string {
    const normalized = String(planCode || "").toUpperCase();
    if (normalized === "DEVELOPER") return "BASIC";
    if (normalized === "TEAM") return "PRO";
    return normalized;
}

/** Minimum seats per plan (TEAM/PRO requires 5) */
export function minSeatsForPlan(planCode: string): number {
    const normalized = String(planCode || "").toUpperCase();
    if (normalized === "TEAM" || normalized === "PRO") return 5;
    return 1;
}

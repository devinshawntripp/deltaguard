import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/users";
import { acceptOrgInvite } from "@/lib/orgs";
import { withRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withRateLimit(async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email = String(body?.email || "");
        const password = String(body?.password || "");
        const name = typeof body?.name === "string" ? body.name : "";
        const inviteToken = typeof body?.invite_token === "string" ? body.invite_token.trim() : "";

        const result = await registerUser({ email, password, name });
        let invite: { accepted: boolean; error?: string } | undefined;
        if (inviteToken) {
            const accepted = await acceptOrgInvite({
                token: inviteToken,
                userId: result.user.id,
                userEmail: result.user.email,
            });
            invite = accepted.ok ? { accepted: true } : { accepted: false, error: accepted.reason };
        }

        return NextResponse.json({
            ok: true,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
            },
            org_id: result.orgId,
            roles_mask: result.rolesMask.toString(),
            invite,
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        const status = /already registered|password|email/.test(message.toLowerCase()) ? 400 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}, { maxRequests: 10, windowSeconds: 60 });

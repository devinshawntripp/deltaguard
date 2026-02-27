import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import crypto from "node:crypto";
import { z } from "zod";
import {
    createOrUpdateOAuthUser,
    getPrimaryMembership,
    getUserByEmail,
    verifyPassword,
} from "@/lib/users";
import { getCachedTokenVersion, isSessionSidRevoked, revokeSessionSid, setCachedTokenVersion } from "@/lib/redis";
import { ROLE_VIEWER } from "@/lib/roles";

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    );
}

providers.push(
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            const parsed = credentialsSchema.safeParse(credentials);
            if (!parsed.success) return null;

            const user = await getUserByEmail(parsed.data.email);
            if (!user || !user.password_hash) return null;

            const ok = await verifyPassword(parsed.data.password, user.password_hash);
            if (!ok) return null;

            const membership = await getPrimaryMembership(user.id);
            if (!membership) return null;

            await setCachedTokenVersion(user.id, user.token_version);

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                org_id: membership.org_id,
                roles_mask: membership.roles_mask.toString(),
                token_version: user.token_version,
            } as any;
        },
    }),
);

function parseSeconds(raw: string | undefined, fallback: number): number {
    const n = Number(raw || "");
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.trunc(n);
}

const SESSION_MAX_AGE_SECONDS = parseSeconds(
    process.env.AUTH_SESSION_MAX_AGE_SECONDS,
    60 * 60 * 24 * 7,
);
const SESSION_UPDATE_AGE_SECONDS = parseSeconds(
    process.env.AUTH_SESSION_UPDATE_AGE_SECONDS,
    60 * 30,
);

export const authOptions: NextAuthOptions = {
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    providers,
    session: {
        strategy: "jwt",
        maxAge: SESSION_MAX_AGE_SECONDS,
        updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    jwt: {
        maxAge: SESSION_MAX_AGE_SECONDS,
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider !== "google") return true;

            const email = (user.email || "").trim().toLowerCase();
            if (!email) return false;

            const dbUser = await createOrUpdateOAuthUser({
                email,
                name: user.name || null,
                provider: "google",
            });
            const membership = await getPrimaryMembership(dbUser.id);
            if (!membership) return false;

            (user as any).id = dbUser.id;
            (user as any).org_id = membership.org_id;
            (user as any).roles_mask = membership.roles_mask.toString();
            (user as any).token_version = dbUser.token_version;
            return true;
        },
        async jwt({ token, user }) {
            if (user?.id) {
                token.sub = String(user.id);
                token.org_id = (user as any).org_id || token.org_id;
                token.roles_mask = (user as any).roles_mask || token.roles_mask || ROLE_VIEWER.toString();
                token.token_version = Number((user as any).token_version ?? token.token_version ?? 0);
                token.sid = crypto.randomUUID();
                token.revoked = false;
                await setCachedTokenVersion(String(user.id), Number(token.token_version || 0));
            }

            if (!token.sid) {
                token.sid = crypto.randomUUID();
            }

            const sid = typeof token.sid === "string" ? token.sid : "";
            if (sid) {
                const revoked = await isSessionSidRevoked(sid);
                if (revoked) {
                    token.revoked = true;
                    return token;
                }
            }

            const userId = typeof token.sub === "string" ? token.sub : "";
            if (userId) {
                const cachedVersion = await getCachedTokenVersion(userId);
                const tokenVersion = Number(token.token_version ?? 0);
                if (cachedVersion != null && tokenVersion < cachedVersion) {
                    token.revoked = true;
                    return token;
                }
            }

            token.revoked = false;
            return token;
        },
        async session({ session, token }) {
            session.sid = typeof token.sid === "string" ? token.sid : undefined;
            session.org_id = typeof token.org_id === "string" ? token.org_id : undefined;
            session.roles_mask = typeof token.roles_mask === "string" ? token.roles_mask : ROLE_VIEWER.toString();
            session.token_version = Number(token.token_version ?? 0);
            session.revoked = token.revoked === true;

            session.user = {
                ...(session.user || {}),
                id: typeof token.sub === "string" ? token.sub : undefined,
                email: typeof token.email === "string" ? token.email : session.user?.email || null,
                name: typeof token.name === "string" ? token.name : session.user?.name || null,
                org_id: session.org_id,
                roles_mask: session.roles_mask,
            } as any;

            return session;
        },
    },
    events: {
        async signOut(message) {
            const sid = (message as any)?.token?.sid;
            if (typeof sid === "string" && sid) {
                await revokeSessionSid(sid);
            }
        },
    },
    pages: {
        signIn: "/signin",
    },
};

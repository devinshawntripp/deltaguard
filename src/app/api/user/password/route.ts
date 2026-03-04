import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import {
    getUserById,
    verifyPassword,
    hashPassword,
    incrementUserTokenVersion,
} from "@/lib/users";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
    const actor = await resolveRequestActor(req);
    if (!actor || actor.kind !== "user" || !actor.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
        current_password?: string;
        new_password?: string;
        confirm_password?: string;
    } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const currentPassword = String(body.current_password || "").trim();
    const newPassword = String(body.new_password || "").trim();
    const confirmPassword = String(body.confirm_password || "").trim();

    if (!currentPassword) {
        return NextResponse.json(
            { error: "Current password is required" },
            { status: 400 },
        );
    }
    if (!newPassword) {
        return NextResponse.json(
            { error: "New password is required" },
            { status: 400 },
        );
    }
    if (newPassword.length < 10) {
        return NextResponse.json(
            { error: "New password must be at least 10 characters" },
            { status: 400 },
        );
    }
    if (newPassword !== confirmPassword) {
        return NextResponse.json(
            { error: "New password and confirmation do not match" },
            { status: 400 },
        );
    }

    await ensurePlatformSchema();

    const user = await getUserById(actor.userId);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.password_hash) {
        return NextResponse.json(
            { error: "Account does not use password authentication" },
            { status: 400 },
        );
    }

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
        return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 403 },
        );
    }

    const newHash = await hashPassword(newPassword);
    await prisma.$executeRaw`
UPDATE users
SET password_hash = ${newHash},
    updated_at = now()
WHERE id = ${actor.userId}::uuid
    `;

    // Increment token version to invalidate all existing sessions
    await incrementUserTokenVersion(actor.userId);

    return NextResponse.json({ ok: true });
}

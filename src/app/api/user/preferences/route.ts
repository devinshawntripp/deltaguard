import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import { getUserThemePreference, setUserThemePreference } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor || actor.kind !== "user" || !actor.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const theme = await getUserThemePreference(actor.userId);
  return NextResponse.json({ theme });
}

export async function PATCH(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor || actor.kind !== "user" || !actor.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { theme?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const rawTheme = String(body.theme || "").trim();
  if (!rawTheme) {
    return NextResponse.json({ error: "theme is required" }, { status: 400 });
  }
  if (!["light", "dark", "system"].includes(rawTheme)) {
    return NextResponse.json({ error: "theme must be one of light|dark|system" }, { status: 400 });
  }

  const theme = await setUserThemePreference(actor.userId, rawTheme);
  return NextResponse.json({ ok: true, theme });
}

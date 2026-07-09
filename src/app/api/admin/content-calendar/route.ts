import { NextRequest, NextResponse } from "next/server";
import { forbiddenByRole, resolveRequestActor } from "@/lib/authz";
import { getCalendarData, upsertMeta } from "@/lib/contentCalendar";
import { ADMIN_OVERRIDE } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_ONLY_ROLES = [ADMIN_OVERRIDE];

function unauthorizedResponse() {
  return NextResponse.json(
    {
      error: "Unauthorized",
      code: "unauthorized",
    },
    { status: 401 },
  );
}

function databaseUnavailableResponse(err: unknown) {
  const detail = err instanceof Error ? err.message : String(err);
  return NextResponse.json(
    {
      error: "Content calendar is unavailable: the database could not be reached.",
      code: "db_unavailable",
      detail,
    },
    { status: 503 },
  );
}

export async function GET(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return unauthorizedResponse();
  if (actor.rolesMask !== ADMIN_OVERRIDE) {
    return forbiddenByRole(actor, ADMIN_ONLY_ROLES, "manage the content calendar");
  }

  try {
    const items = await getCalendarData();
    return NextResponse.json({ items });
  } catch (err) {
    return databaseUnavailableResponse(err);
  }
}

export async function PUT(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return unauthorizedResponse();
  if (actor.rolesMask !== ADMIN_OVERRIDE) {
    return forbiddenByRole(actor, ADMIN_ONLY_ROLES, "manage the content calendar");
  }

  let body: {
    slug?: string;
    difficulty?: number;
    monthly_volume?: number;
    keyword?: string;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      {
        error: "invalid JSON body",
        code: "bad_request",
      },
      { status: 400 },
    );
  }

  const slug = String(body?.slug || "").trim();
  if (!slug) {
    return NextResponse.json(
      {
        error: "slug is required",
        code: "bad_request",
      },
      { status: 400 },
    );
  }

  if (body.difficulty !== undefined) {
    if (
      !Number.isInteger(body.difficulty) ||
      body.difficulty < 0 ||
      body.difficulty > 100
    ) {
      return NextResponse.json(
        {
          error: "difficulty must be an integer between 0 and 100",
          code: "bad_request",
        },
        { status: 400 },
      );
    }
  }

  if (body.monthly_volume !== undefined) {
    if (!Number.isInteger(body.monthly_volume) || body.monthly_volume < 0) {
      return NextResponse.json(
        {
          error: "monthly_volume must be a non-negative integer",
          code: "bad_request",
        },
        { status: 400 },
      );
    }
  }

  if (body.keyword !== undefined && typeof body.keyword !== "string") {
    return NextResponse.json(
      {
        error: "keyword must be a string",
        code: "bad_request",
      },
      { status: 400 },
    );
  }

  try {
    const item = await upsertMeta(slug, {
      difficulty: body.difficulty,
      monthly_volume: body.monthly_volume,
      keyword: body.keyword,
    });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return databaseUnavailableResponse(err);
  }
}

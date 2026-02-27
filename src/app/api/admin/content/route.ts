import { NextRequest, NextResponse } from "next/server";
import { getDefaultAdminContent } from "@/lib/adminContent";
import { forbiddenByRole, resolveRequestActor } from "@/lib/authz";
import { ensurePlatformSchema, prisma } from "@/lib/prisma";
import { ADMIN_OVERRIDE } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_ONLY_ROLES = [ADMIN_OVERRIDE];

type AdminContentRow = {
  key: string;
  content_md: string;
  updated_at: string;
  updated_by: string | null;
  updated_by_email: string | null;
};

function unauthorizedResponse() {
  return NextResponse.json(
    {
      error: "Unauthorized",
      code: "unauthorized",
    },
    { status: 401 },
  );
}

async function fetchAdminContent(key: string): Promise<AdminContentRow | null> {
  const rows = await prisma.$queryRaw<AdminContentRow[]>`
SELECT
  c.key,
  c.content_md,
  c.updated_at::text AS updated_at,
  c.updated_by::text AS updated_by,
  u.email AS updated_by_email
FROM admin_content c
LEFT JOIN users u ON u.id = c.updated_by
WHERE c.key=${key}
LIMIT 1
  `;
  return rows[0] || null;
}

export async function GET(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return unauthorizedResponse();
  if (actor.rolesMask !== ADMIN_OVERRIDE) {
    return forbiddenByRole(actor, ADMIN_ONLY_ROLES, "manage admin content");
  }

  const key = String(req.nextUrl.searchParams.get("key") || "").trim();
  if (!key) {
    return NextResponse.json(
      {
        error: "key query param required",
        code: "bad_request",
      },
      { status: 400 },
    );
  }

  await ensurePlatformSchema();
  let row = await fetchAdminContent(key);
  if (!row) {
    const fallback = getDefaultAdminContent(key);
    if (fallback == null) {
      return NextResponse.json(
        {
          error: "content key not found",
          code: "not_found",
        },
        { status: 404 },
      );
    }
    await prisma.$executeRaw`
INSERT INTO admin_content (key, content_md)
VALUES (${key}, ${fallback})
ON CONFLICT (key) DO NOTHING
    `;
    row = await fetchAdminContent(key);
  }

  if (!row) {
    return NextResponse.json(
      {
        error: "content key not found",
        code: "not_found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ item: row });
}

export async function PUT(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return unauthorizedResponse();
  if (actor.rolesMask !== ADMIN_OVERRIDE) {
    return forbiddenByRole(actor, ADMIN_ONLY_ROLES, "manage admin content");
  }

  let body: { key?: string; content_md?: string } = {};
  try {
    body = (await req.json()) as { key?: string; content_md?: string };
  } catch {
    return NextResponse.json(
      {
        error: "invalid JSON body",
        code: "bad_request",
      },
      { status: 400 },
    );
  }

  const key = String(body?.key || "").trim();
  const contentMd = typeof body?.content_md === "string" ? body.content_md : "";
  if (!key) {
    return NextResponse.json(
      {
        error: "key is required",
        code: "bad_request",
      },
      { status: 400 },
    );
  }
  if (!contentMd.trim()) {
    return NextResponse.json(
      {
        error: "content_md is required",
        code: "bad_request",
      },
      { status: 400 },
    );
  }
  if (contentMd.length > 200_000) {
    return NextResponse.json(
      {
        error: "content_md too large (max 200000 chars)",
        code: "bad_request",
      },
      { status: 400 },
    );
  }

  await ensurePlatformSchema();
  const previous = await fetchAdminContent(key);
  const updatedBy = actor.kind === "user" ? actor.userId || null : null;

  if (previous && previous.content_md !== contentMd) {
    await prisma.$executeRaw`
INSERT INTO admin_content_versions (key, content_md, updated_by)
VALUES (${key}, ${previous.content_md}, CAST(${updatedBy} AS UUID))
    `;
  }

  await prisma.$executeRaw`
INSERT INTO admin_content (key, content_md, updated_by, updated_at)
VALUES (${key}, ${contentMd}, CAST(${updatedBy} AS UUID), now())
ON CONFLICT (key)
DO UPDATE SET
  content_md = EXCLUDED.content_md,
  updated_by = EXCLUDED.updated_by,
  updated_at = now()
  `;

  const row = await fetchAdminContent(key);
  return NextResponse.json({ ok: true, item: row });
}

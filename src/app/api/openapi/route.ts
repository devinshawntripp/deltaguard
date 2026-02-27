import { NextRequest, NextResponse } from "next/server";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";
import { buildOpenApiDocument } from "@/lib/openapi";
import { inferBaseUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
    return forbiddenByRole(actor, JOB_READ_ROLES, "view API docs");
  }

  const baseUrl = inferBaseUrl(req);
  return NextResponse.json(buildOpenApiDocument(baseUrl), {
    headers: {
      "cache-control": "no-store",
    },
  });
}

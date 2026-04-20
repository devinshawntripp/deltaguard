import { NextResponse } from "next/server";
import os from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    version: process.env.APP_VERSION || "dev",
    commit: process.env.APP_COMMIT || "unknown",
    pod: process.env.HOSTNAME || os.hostname(),
    node: process.env.NODE_NAME || "unknown",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

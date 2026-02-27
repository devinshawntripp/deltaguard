import { installScriptResponse } from "@/lib/installScript";

export const dynamic = "force-dynamic";

export async function GET() {
  return installScriptResponse();
}

export async function HEAD() {
  return installScriptResponse();
}

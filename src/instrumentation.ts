// Next.js runs register() once when the server process boots. We use it to warm
// the Prisma connection pool and run the idempotent schema bootstrap up front,
// so the FIRST real user request (historically /api/auth/register) no longer
// pays cold-connection + CREATE TABLE/INDEX latency. Measured cold first-hit was
// ~8.6s; warm is ~0.7s. Guarded to the Node.js runtime (Prisma can't run on edge)
// and never throws — a warmup failure must not crash boot; the request path still
// runs ensurePlatformSchema() lazily as before.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { prisma } = await import("@/lib/prisma");
    const { ensurePlatformSchema } = await import("@/lib/prisma");
    await ensurePlatformSchema();
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    console.warn("[instrumentation] DB warmup skipped:", err instanceof Error ? err.message : err);
  }
}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const prismaPath = path.join(process.cwd(), "src/lib/prisma.ts");
const orgMembersRoutePath = path.join(process.cwd(), "src/app/api/org/members/route.ts");
const orgInvitesRoutePath = path.join(process.cwd(), "src/app/api/org/invites/route.ts");
const orgsRoutePath = path.join(process.cwd(), "src/app/api/orgs/route.ts");
const orgsActiveRoutePath = path.join(process.cwd(), "src/app/api/orgs/active/route.ts");
const registerRoutePath = path.join(process.cwd(), "src/app/api/auth/register/route.ts");
const orgsLibPath = path.join(process.cwd(), "src/lib/orgs.ts");

test("schema includes org invites and active org pointer", () => {
  const src = fs.readFileSync(prismaPath, "utf8");
  assert.match(src, /CREATE TABLE IF NOT EXISTS org_invites/);
  assert.match(src, /ALTER TABLE users ADD COLUMN IF NOT EXISTS active_org_id UUID/);
  assert.match(src, /users_active_org_id_fkey/);
});

test("org member manager includes org owner but role mask edits remain admin-override only", () => {
  const src = fs.readFileSync(orgMembersRoutePath, "utf8");
  assert.match(src, /const ORG_MANAGER_ROLES = \[ROLE_ORG_OWNER, ADMIN_OVERRIDE\];/);
  assert.match(src, /only admin override can change role masks/);
});

test("org invite and org context routes are exposed", () => {
  const inviteSrc = fs.readFileSync(orgInvitesRoutePath, "utf8");
  const orgsSrc = fs.readFileSync(orgsRoutePath, "utf8");
  const activeSrc = fs.readFileSync(orgsActiveRoutePath, "utf8");

  assert.match(inviteSrc, /export async function GET/);
  assert.match(inviteSrc, /export async function POST/);
  assert.match(orgsSrc, /export async function GET/);
  assert.match(orgsSrc, /export async function POST/);
  assert.match(activeSrc, /export async function POST/);
});

test("registration route supports optional invite token acceptance", () => {
  const src = fs.readFileSync(registerRoutePath, "utf8");
  assert.match(src, /invite_token/);
  assert.match(src, /acceptOrgInvite/);
});

test("global admin org listing/switching is supported without per-org membership", () => {
  const src = fs.readFileSync(orgsLibPath, "utf8");
  assert.match(src, /async function isGlobalAdminUser/);
  assert.match(src, /LEFT JOIN org_memberships/);
  assert.match(src, /JOIN orgs o ON TRUE/);
});

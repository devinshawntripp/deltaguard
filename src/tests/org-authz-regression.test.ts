import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const usersPath = path.join(process.cwd(), "src/lib/users.ts");
const authzPath = path.join(process.cwd(), "src/lib/authz.ts");
const orgMembersRoutePath = path.join(process.cwd(), "src/app/api/org/members/route.ts");
const legacyPackagesRoutePath = path.join(process.cwd(), "src/app/api/packages/route.ts");
const legacyPackageByIdRoutePath = path.join(process.cwd(), "src/app/api/packages/[id]/route.ts");
const legacyPackagesEventsRoutePath = path.join(process.cwd(), "src/app/api/packages/events/route.ts");
const legacyScanCancelRoutePath = path.join(process.cwd(), "src/app/api/scans/[id]/cancel/route.ts");
const legacyScanEventsRoutePath = path.join(process.cwd(), "src/app/api/scans/[id]/events/route.ts");

test("new registrations default to viewer role unless first bootstrap admin", () => {
  const src = fs.readFileSync(usersPath, "utf8");
  assert.match(src, /const roleMask = isFirst \? BigInt\(ADMIN_OVERRIDE_MASK\) : ROLE_VIEWER;/);
});

test("org membership management is admin-override only and user-session only", () => {
  const src = fs.readFileSync(orgMembersRoutePath, "utf8");
  assert.match(src, /const ORG_MANAGER_ROLES = \[ROLE_ORG_OWNER, ADMIN_OVERRIDE\];/);
  assert.match(src, /only admin override can change role masks/);
  assert.match(src, /requiredKinds:\s*\["user"\]/);
  assert.match(src, /feature:\s*"update org members"/);
});

test("request actor resolution enforces active DB membership roles, not token roles alone", () => {
  const src = fs.readFileSync(authzPath, "utf8");
  assert.match(src, /const activeOrgId = await getUserActiveOrgId\(userId\);/);
  assert.match(src, /const membership = await getMembershipForUserInOrg\(userId,\s*candidate\);/);
  assert.match(src, /const primary = await getFirstActiveMembership\(userId\);/);
});

test("admin override is treated as global for org targeting while preserving org-scoped memberships", () => {
  const src = fs.readFileSync(authzPath, "utf8");
  assert.match(src, /const isGlobalAdmin = await userHasAdminOverride\(userId\);/);
  assert.match(src, /if \(isGlobalAdmin && await orgExistsCached\(candidate\)\)/);
  assert.match(src, /rolesMask = ADMIN_OVERRIDE;/);
});

test("legacy package/scan routes are protected by centralized actor checks", () => {
  const packagesSrc = fs.readFileSync(legacyPackagesRoutePath, "utf8");
  const packageByIdSrc = fs.readFileSync(legacyPackageByIdRoutePath, "utf8");
  const packageEventsSrc = fs.readFileSync(legacyPackagesEventsRoutePath, "utf8");
  const scanCancelSrc = fs.readFileSync(legacyScanCancelRoutePath, "utf8");
  const scanEventsSrc = fs.readFileSync(legacyScanEventsRoutePath, "utf8");

  assert.match(packagesSrc, /requireRequestActor/);
  assert.match(packageByIdSrc, /requireRequestActor/);
  assert.match(packageEventsSrc, /requireRequestActor/);
  assert.match(scanCancelSrc, /requireRequestActor/);
  assert.match(scanEventsSrc, /requireRequestActor/);
});

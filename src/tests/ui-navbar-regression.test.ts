import { readFileSync } from "fs";
import path from "path";
import { test } from "node:test";
import assert from "node:assert";

const publicShellSrc = readFileSync(
    path.join(process.cwd(), "src/components/PublicSiteShell.tsx"),
    "utf-8"
);

const publicNavClientSrc = readFileSync(
    path.join(process.cwd(), "src/components/PublicNavClient.tsx"),
    "utf-8"
);

const docsLayoutSrc = readFileSync(
    path.join(process.cwd(), "src/app/docs/layout.tsx"),
    "utf-8"
);

test("UIBF-04: PublicSiteShell calls getServerSession for auth-aware navbar", () => {
    assert.ok(
        publicShellSrc.includes("getServerSession"),
        "PublicSiteShell must call getServerSession to check auth state"
    );
});

test("UIBF-04: PublicSiteShell is NOT a client component", () => {
    assert.ok(
        !publicShellSrc.includes('"use client"'),
        "PublicSiteShell must be a server component (no 'use client' directive)"
    );
});

test("UIBF-03: PublicNavClient is a client component with hamburger", () => {
    assert.ok(
        publicNavClientSrc.includes('"use client"'),
        "PublicNavClient must be a client component"
    );
    assert.ok(
        publicNavClientSrc.includes("lg:hidden"),
        "PublicNavClient must hide hamburger on desktop (lg:hidden)"
    );
});

test("UIBF-04: PublicNavClient renders conditional auth section", () => {
    assert.ok(
        publicNavClientSrc.includes("isSignedIn"),
        "PublicNavClient must accept isSignedIn prop for conditional rendering"
    );
    assert.ok(
        publicNavClientSrc.includes("Dashboard") && publicNavClientSrc.includes("Sign in"),
        "PublicNavClient must render Dashboard link for signed-in and Sign in for signed-out"
    );
});

test("UIBF-03/04: DocsLayout is NOT a client component (allows server PublicSiteShell)", () => {
    assert.ok(
        !docsLayoutSrc.includes('"use client"'),
        "DocsLayout must be a server component so PublicSiteShell can call getServerSession"
    );
});

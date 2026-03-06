"use client";

import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";

export default function DashboardNavClient({
    email,
    isAdminOverride,
}: {
    email: string;
    isAdminOverride: boolean;
}) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const navLinks = (
        <>
            <Link href="/dashboard" className="app-nav-link">Dashboard</Link>
            <Link href="/dashboard/settings/scanner" className="app-nav-link">Scanner</Link>
            <Link href="/dashboard/settings/registries" className="app-nav-link">Registries</Link>
            <Link href="/dashboard/settings/org" className="app-nav-link">Org</Link>
            {isAdminOverride ? <Link href="/dashboard/settings/admin" className="app-nav-link">Master Admin</Link> : null}
            <Link href="/dashboard/settings/api-keys" className="app-nav-link">API Keys</Link>
            <Link href="/dashboard/settings/api-docs" className="app-nav-link">API Docs</Link>
            <Link href="/docs" className="app-nav-link">Docs</Link>
            <Link href="/dashboard/settings/billing" className="app-nav-link">Billing</Link>
        </>
    );

    return (
        <>
            {/* Desktop nav — hidden below lg */}
            <nav className="app-nav hidden lg:flex">
                {navLinks}
                <ThemeToggle />
                <span className="muted max-w-[220px] truncate text-xs">{email}</span>
                <SignOutButton />
            </nav>

            {/* Hamburger button — visible below lg only */}
            <button
                className="lg:hidden btn-secondary inline-flex items-center gap-1.5"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Toggle navigation"
                aria-expanded={mobileOpen}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M2 4h12M2 8h12M2 12h12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-xs">Menu</span>
            </button>

            {/* Mobile dropdown panel — pushes content down, no overlay */}
            {mobileOpen && (
                <div className="lg:hidden w-full border-t border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] p-4 grid gap-2">
                    {navLinks}
                    <ThemeToggle />
                    <span className="muted truncate text-xs">{email}</span>
                    <SignOutButton />
                </div>
            )}
        </>
    );
}

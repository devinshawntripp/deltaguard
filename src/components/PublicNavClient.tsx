"use client";

import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";

export default function PublicNavClient({ isSignedIn }: { isSignedIn: boolean }) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const navLinks = (
        <>
            <Link href="/docs" className="app-nav-link">Docs</Link>
            <Link href="/roadmap" className="app-nav-link">Roadmap</Link>
            <Link href="/blog" className="app-nav-link">Blog</Link>
            <a href="https://scanrook.sh" className="app-nav-link">Install</a>
        </>
    );

    const authSection = isSignedIn ? (
        <>
            <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
            <SignOutButton />
        </>
    ) : (
        <Link href="/signin" className="btn-secondary">Sign in</Link>
    );

    return (
        <>
            {/* Desktop nav — hidden below lg */}
            <nav className="app-nav hidden lg:flex">
                {navLinks}
                <ThemeToggle />
                {authSection}
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
                    {authSection}
                </div>
            )}
        </>
    );
}

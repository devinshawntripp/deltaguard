"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
    href: string;
    label: string;
    children?: NavItem[];
};

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
    const isActive = pathname === item.href;
    const isParentActive = item.children?.some((c) => pathname === c.href);

    return (
        <div>
            <Link
                href={item.children ? item.children[0].href : item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                        ? "font-semibold bg-[var(--dg-accent-soft)] border border-[color-mix(in_srgb,var(--dg-accent)_50%,var(--dg-border))]"
                        : "hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                }`}
                style={isActive ? { color: "var(--dg-accent-ink)" } : undefined}
            >
                {item.label}
            </Link>
            {item.children && (
                <div className={`ml-3 mt-0.5 grid gap-0.5 border-l border-black/10 dark:border-white/10 pl-2 ${isParentActive || isActive ? "" : ""}`}>
                    {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                                    childActive
                                        ? "font-semibold bg-[var(--dg-accent-soft)] border border-[color-mix(in_srgb,var(--dg-accent)_50%,var(--dg-border))]"
                                        : "hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                                }`}
                                style={childActive ? { color: "var(--dg-accent-ink)" } : undefined}
                            >
                                {child.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Breadcrumbs({
    pathname,
    breadcrumbLabels,
}: {
    pathname: string;
    breadcrumbLabels: Record<string, string>;
}) {
    const segments = pathname.replace(/^\//, "").split("/");
    const crumbs = segments.map((seg, i) => ({
        label: breadcrumbLabels[seg] || seg,
        href: "/" + segments.slice(0, i + 1).join("/"),
        isLast: i === segments.length - 1,
    }));

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs muted mb-4">
            {crumbs.map((crumb, i) => (
                <span key={crumb.href} className="inline-flex items-center gap-1.5">
                    {i > 0 && (
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="opacity-40">
                            <path d="M3.5 2L6.5 5L3.5 8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                    {crumb.isLast ? (
                        <span className="font-medium" style={{ color: "var(--dg-text)" }}>{crumb.label}</span>
                    ) : (
                        <Link href={crumb.href} className="hover:underline">{crumb.label}</Link>
                    )}
                </span>
            ))}
        </nav>
    );
}

export default function DocsSidebarClient({
    navItems,
    breadcrumbLabels,
    children,
}: {
    navItems: NavItem[];
    breadcrumbLabels: Record<string, string>;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="btn-secondary inline-flex items-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M2 4h12M2 8h12M2 12h12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {sidebarOpen ? "Hide navigation" : "Show navigation"}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
                <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur p-4">
                    <div className="text-xs uppercase tracking-wide muted mb-2">Documentation</div>
                    <nav className="grid gap-1">
                        {navItems.map((item) => (
                            <SidebarLink key={item.href} item={item} pathname={pathname} />
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0">
                <Breadcrumbs pathname={pathname} breadcrumbLabels={breadcrumbLabels} />
                {children}
            </div>
        </div>
    );
}

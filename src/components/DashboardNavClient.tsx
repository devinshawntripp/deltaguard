"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import BrandLogo from "@/components/BrandLogo";

/* ── SVG Icons (16x16, stroke-based, currentColor) ── */

const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6" /><path d="M8 4.5v3.5l2.5 1.5" />
  </svg>
);

const IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12l3.5-4 3 2.5L14 4" /><path d="M10.5 4H14v3.5" />
  </svg>
);

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M8 1.5L2.5 4v4c0 3.5 2.5 5.5 5.5 6.5 3-1 5.5-3 5.5-6.5V4z" />
  </svg>
);

const IconFileText = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 1.5h5.5L13 5v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2.5a1 1 0 011-1z" strokeLinejoin="round" />
    <path d="M9.5 1.5V5H13" strokeLinejoin="round" /><path d="M5.5 8.5h5M5.5 11h3" />
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v8.5M4.5 7.5L8 11l3.5-3.5" /><path d="M2.5 12.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" />
  </svg>
);

const IconBox = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5l6-3 6 3-6 3-6-3z" /><path d="M2 5v6l6 3V8" /><path d="M14 5v6l-6 3V8" />
  </svg>
);

const IconCog = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2" /><path d="M8 1.5v1.25M8 13.25v1.25M3.4 3.4l.9.9M11.7 11.7l.9.9M1.5 8h1.25M13.25 8h1.25M3.4 12.6l.9-.9M11.7 4.3l.9-.9" />
  </svg>
);

const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13a2 2 0 004 0" /><path d="M3.5 6.5a4.5 4.5 0 019 0c0 2.5 1 4 1.5 5H2c.5-1 1.5-2.5 1.5-5z" />
  </svg>
);

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5" /><path d="M1 13.5c0-2.5 2-4 5-4s5 1.5 5 4" />
    <circle cx="12" cy="5.5" r="1.75" /><path d="M12 9.5c2 0 3.5 1 3.5 3" />
  </svg>
);

const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="10.5" r="3" /><path d="M7.5 8.5L13 3" /><path d="M11 3l2 2" /><path d="M9.5 5l1.5 1.5" />
  </svg>
);

const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2.5h4.5a1.5 1.5 0 011.5 1.5v10S7 13 4.5 13H2V2.5z" />
    <path d="M14 2.5H9.5A1.5 1.5 0 008 4v10s1-1 3.5-1H14V2.5z" />
  </svg>
);

const IconCreditCard = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="3" width="13" height="10" rx="1.5" /><path d="M1.5 7h13" /><path d="M4.5 10.5h3" />
  </svg>
);

const IconClipboard = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="10" height="12" rx="1.5" /><path d="M5.5 2.5V1.5a1 1 0 011-1h3a1 1 0 011 1v1" /><path d="M5.5 6.5h5M5.5 9h3.5" />
  </svg>
);

const IconWrench = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5a4 4 0 00-3.8 5.2L2.5 11.5l2 2 3.8-3.7A4 4 0 0010 2.5z" />
  </svg>
);

const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13V8M8 13V3M12 13V6" />
  </svg>
);

const IconExternalLink = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4.5a1 1 0 01-1 1H2.5a1 1 0 01-1-1V5a1 1 0 011-1H7" /><path d="M10 1.5h4.5V6" /><path d="M6.5 9.5L14.5 1.5" />
  </svg>
);

const IconCollapse = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="13" height="13" rx="2" /><path d="M6 1.5v13" /><path d="M10 6l-2 2 2 2" />
  </svg>
);

const IconExpand = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="13" height="13" rx="2" /><path d="M6 1.5v13" /><path d="M9 6l2 2-2 2" />
  </svg>
);

const IconHamburger = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M2 4h12M2 8h12M2 12h12" />
  </svg>
);

/* ── Types ── */

type NavItem = {
  label: string;
  href: string;
  icon: React.FC;
  external?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

/* ── Sidebar ── */

const STORAGE_KEY = "sr-sidebar-collapsed";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
}

export default function DashboardNavClient({
  email,
  isAdminOverride,
}: {
  email: string;
  isAdminOverride: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(getInitialCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const sections: NavSection[] = React.useMemo(() => {
    const s: NavSection[] = [
      {
        title: "Scanning",
        items: [
          { label: "Dashboard", href: "/dashboard", icon: IconGrid },
          { label: "Schedules", href: "/dashboard/schedules", icon: IconClock },
          { label: "Trends", href: "/dashboard/trends", icon: IconTrend },
        ],
      },
      {
        title: "Security",
        items: [
          { label: "Policies", href: "/dashboard/policies", icon: IconShield },
          { label: "Licenses", href: "/dashboard/licenses", icon: IconFileText },
          { label: "Reports", href: "/dashboard/reports", icon: IconDownload },
        ],
      },
      {
        title: "Infrastructure",
        items: [
          { label: "Registries", href: "/dashboard/settings/registries", icon: IconBox },
          { label: "Scanner", href: "/dashboard/settings/scanner", icon: IconCog },
        ],
      },
      {
        title: "Notifications",
        items: [
          { label: "Notifications", href: "/dashboard/settings/notifications", icon: IconBell },
        ],
      },
      {
        title: "Organization",
        items: [
          { label: "Org", href: "/dashboard/settings/org", icon: IconUsers },
          { label: "API Keys", href: "/dashboard/settings/api-keys", icon: IconKey },
          { label: "API Docs", href: "/dashboard/settings/api-docs", icon: IconBook },
          { label: "Billing", href: "/dashboard/settings/billing", icon: IconCreditCard },
          { label: "Audit Log", href: "/dashboard/settings/audit-log", icon: IconClipboard },
        ],
      },
    ];

    if (isAdminOverride) {
      s.push({
        title: "Admin",
        items: [
          { label: "Master Admin", href: "/dashboard/settings/admin", icon: IconWrench },
          { label: "Features", href: "/dashboard/admin/features", icon: IconBarChart },
        ],
      });
    }

    return s;
  }, [isAdminOverride]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  /* Shared nav content renderer */
  const renderNav = (inMobile: boolean) => (
    <>
      {sections.map((section) => (
        <div key={section.title} className="sidebar-section">
          {(!collapsed || inMobile) && (
            <div className="sidebar-section-title">{section.title}</div>
          )}
          {collapsed && !inMobile && <div className="sidebar-section-divider" />}
          {section.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => inMobile && setMobileOpen(false)}
                className={`sidebar-item ${active ? "sidebar-item-active" : ""}`}
                title={collapsed && !inMobile ? item.label : undefined}
              >
                <item.icon />
                {(!collapsed || inMobile) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Docs link */}
      <div className="sidebar-section">
        {(!collapsed || inMobile) && <div className="sidebar-section-title">&nbsp;</div>}
        {collapsed && !inMobile && <div className="sidebar-section-divider" />}
        <Link
          href="/docs"
          onClick={() => inMobile && setMobileOpen(false)}
          className="sidebar-item"
          title={collapsed && !inMobile ? "Docs" : undefined}
        >
          <IconExternalLink />
          {(!collapsed || inMobile) && <span>Docs</span>}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <IconHamburger />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={() => setMobileOpen(false)}>
          <nav
            className="sidebar sidebar-mobile"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sidebar-brand">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <BrandLogo />
              </Link>
            </div>
            <div className="sidebar-nav-scroll">
              {renderNav(true)}
            </div>
            <div className="sidebar-footer">
              <ThemeToggle />
              <span className="sidebar-email">{email}</span>
              <SignOutButton />
            </div>
          </nav>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <nav className={`sidebar sidebar-desktop ${collapsed ? "sidebar-collapsed" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/dashboard" className="app-brand">
            <BrandLogo compact={collapsed} />
          </Link>
          <button
            className="sidebar-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <IconExpand /> : <IconCollapse />}
          </button>
        </div>
        <div className="sidebar-nav-scroll">
          {renderNav(false)}
        </div>
        <div className="sidebar-footer">
          {!collapsed && <ThemeToggle />}
          {!collapsed && <span className="sidebar-email">{email}</span>}
          <SignOutButton />
        </div>
      </nav>
    </>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[64px_1fr]">
      <header className="backdrop-blur sticky top-0 z-10 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold tracking-tight">DeltaGuard</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="opacity-80 hover:opacity-100">Dashboard</Link>
            <Link href="/" className="opacity-80 hover:opacity-100">Home</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full px-6 py-8">{children}</main>
    </div>
  );
}



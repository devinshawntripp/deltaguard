"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function AuthExpiredOverlay() {
  const pathname = usePathname();
  const [expired, setExpired] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = (async (...args: Parameters<typeof fetch>) => {
      const res = await originalFetch(...args);
      if (res.status === 401) {
        setExpired(true);
      }
      return res;
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!expired) return null;

  const next = encodeURIComponent(pathname || "/dashboard");
  const signInHref = `/signin?next=${next}`;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-sm" />
      <div className="fixed z-[91] bottom-4 right-4 rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-sm shadow">
        Session expired or unauthorized. Please sign in again.
      </div>
      <div className="fixed inset-0 z-[92] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-950 p-5 shadow-xl grid gap-3">
          <h2 className="text-lg font-semibold">Authentication Required</h2>
          <p className="text-sm opacity-80">
            Your session is no longer valid for this action. Sign in again to continue.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setExpired(false)}
              className="rounded border border-black/20 dark:border-white/20 px-3 py-1.5 text-sm"
            >
              Dismiss
            </button>
            <a
              href={signInHref}
              className="rounded bg-black text-white px-3 py-1.5 text-sm"
            >
              Go to Sign In
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

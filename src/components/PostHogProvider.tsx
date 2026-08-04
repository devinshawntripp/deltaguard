"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

// Analytics + session replay.
//
// Two things about this app shape that the copy-paste snippet gets wrong:
//
// 1. The App Router doesn't do full page loads between routes, so PostHog's automatic pageview
//    capture only ever fires once — every subsequent navigation is invisible. Pageviews are captured
//    manually off the pathname instead.
// 2. NEXT_PUBLIC_* is inlined into the client bundle at BUILD time, but this deployment injects env
//    vars at RUNTIME in Kubernetes. Reading the key from process.env here would give undefined in the
//    browser, so it arrives as a prop from the server layout — which also means rotating the key is a
//    restart rather than a rebuild.

export type PostHogUser = { id: string; email?: string | null; name?: string | null } | null;

export default function PostHogProvider({
  apiKey,
  apiHost,
  user,
  children,
}: {
  apiKey: string;
  apiHost: string;
  user: PostHogUser;
  children: React.ReactNode;
}) {
  const started = useRef(false);
  const identified = useRef<string | null>(null);

  useEffect(() => {
    if (started.current || !apiKey) return;
    started.current = true;

    posthog.init(apiKey, {
      // Same-origin so ad blockers don't drop it; ui_host keeps "view in PostHog" links working.
      api_host: apiHost,
      ui_host: "https://us.posthog.com",
      // Captured manually below — see note 1.
      capture_pageview: false,
      capture_pageleave: true,
      // Anonymous visitors still get events; profiles are only created once someone signs in, which
      // keeps the person count meaningful and the bill down.
      person_profiles: "identified_only",
      autocapture: true,
      // Watch what people actually do. Inputs are masked by default because this is a security
      // product — a replay must never become a place where a customer's credentials are stored.
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
        // Passwords, tokens and anything explicitly marked stay redacted even in the DOM snapshot.
        maskInputOptions: { password: true, email: false },
      },
      // Errors show up alongside the replay that produced them.
      capture_exceptions: true,
      persistence: "localStorage+cookie",
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug(false);
      },
    });
  }, [apiKey, apiHost]);

  // Tie the session to the signed-in account, and cleanly separate sessions on sign-out so one
  // person's replay never continues into the next.
  useEffect(() => {
    if (!started.current) return;
    if (user?.id) {
      if (identified.current === user.id) return;
      identified.current = user.id;
      posthog.identify(user.id, { email: user.email ?? undefined, name: user.name ?? undefined });
    } else if (identified.current) {
      identified.current = null;
      posthog.reset();
    }
  }, [user?.id, user?.email, user?.name]);

  return (
    <>
      {/* useSearchParams forces client rendering up to the nearest Suspense boundary, so it lives in
          its own leaf — without this the whole tree opts out of static rendering and the build fails. */}
      <Suspense fallback={null}>
        <PageViews ready={started} />
      </Suspense>
      {children}
    </>
  );
}

// Manual pageviews, including the query string, so funnels and path analysis work across App Router
// navigations rather than only on the first load.
function PageViews({ ready }: { ready: React.RefObject<boolean> }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ready.current || !pathname) return;
    const qs = searchParams?.toString();
    posthog.capture("$pageview", {
      $current_url: window.location.origin + pathname + (qs ? `?${qs}` : ""),
    });
  }, [pathname, searchParams, ready]);

  return null;
}

// Turns a fetch()/network failure from the auth forms into a message a human
// can act on. Browsers reject fetch() with a bare TypeError on any network-layer
// failure — Safari/WebKit uses the message "Load failed", Chromium "Failed to
// fetch" — which is meaningless to a user and, worse, hides that their account
// may actually have been created server-side before the connection dropped.
export function friendlyAuthFetchError(err: unknown): string {
  // Request we aborted on our own timeout.
  if (err instanceof DOMException && err.name === "AbortError") {
    return "The server took too long to respond. Your account may already have been created — try signing in, or try again in a moment.";
  }
  if (err instanceof Error) {
    const m = err.message.trim();
    const networkNoise = /^(load failed|failed to fetch|networkerror|network request failed|the network connection was lost\.?)$/i;
    if (err.name === "TypeError" || networkNoise.test(m)) {
      return "Couldn't reach the server — check your connection and try again. If you already tapped Create account once, your account may exist; try signing in.";
    }
    // A real, human-readable application error (e.g. "email already registered").
    return m;
  }
  return String(err);
}

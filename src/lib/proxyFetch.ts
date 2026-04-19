/**
 * Proxy-aware fetch wrapper for outbound HTTP requests.
 *
 * Node.js built-in fetch() does NOT respect HTTP_PROXY/HTTPS_PROXY env vars.
 * This module creates a fetch function that tunnels through the proxy when
 * the env vars are set, using undici's ProxyAgent.
 *
 * Usage:
 *   import { proxyFetch } from "@/lib/proxyFetch";
 *   const res = await proxyFetch("https://registry-1.docker.io/v2/");
 */

import { ProxyAgent, fetch as undiciFetch } from "undici";

let _dispatcher: ProxyAgent | undefined;

function getDispatcher(): ProxyAgent | undefined {
    if (_dispatcher) return _dispatcher;
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
    if (!proxy) return undefined;
    _dispatcher = new ProxyAgent(proxy);
    return _dispatcher;
}

/**
 * Fetch that routes through HTTP_PROXY/HTTPS_PROXY when set.
 * Falls back to regular fetch when no proxy is configured.
 */
export async function proxyFetch(
    url: string | URL,
    init?: RequestInit & { dispatcher?: ProxyAgent },
): Promise<Response> {
    const dispatcher = init?.dispatcher || getDispatcher();
    if (dispatcher) {
        // undici fetch with ProxyAgent
        return undiciFetch(url, { ...init, dispatcher } as any) as unknown as Response;
    }
    // No proxy — use built-in fetch
    return fetch(url, init);
}

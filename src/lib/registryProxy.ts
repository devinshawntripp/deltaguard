/**
 * Docker Registry V2 API proxy client.
 * Handles the WWW-Authenticate token dance for Docker Hub, GHCR, etc.
 */

type AuthConfig = {
    username?: string | null;
    token?: string | null;
};

type TokenResponse = {
    token?: string;
    access_token?: string;
};

/**
 * Perform the Docker Registry V2 auth token exchange.
 * Registry returns 401 with WWW-Authenticate header pointing to a token endpoint.
 */
async function fetchBearerToken(
    wwwAuthenticate: string,
    auth: AuthConfig,
): Promise<string | null> {
    // Parse: Bearer realm="https://auth.docker.io/token",service="registry.docker.io",scope="..."
    const realmMatch = wwwAuthenticate.match(/realm="([^"]+)"/);
    const serviceMatch = wwwAuthenticate.match(/service="([^"]+)"/);
    const scopeMatch = wwwAuthenticate.match(/scope="([^"]+)"/);

    if (!realmMatch) return null;

    const url = new URL(realmMatch[1]);
    if (serviceMatch) url.searchParams.set("service", serviceMatch[1]);
    if (scopeMatch) url.searchParams.set("scope", scopeMatch[1]);

    const headers: Record<string, string> = {};
    if (auth.username && auth.token) {
        headers["Authorization"] = "Basic " + Buffer.from(`${auth.username}:${auth.token}`).toString("base64");
    }

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) return null;

    const body: TokenResponse = await res.json();
    return body.token || body.access_token || null;
}

/**
 * Make an authenticated request to a Docker Registry V2 endpoint.
 * Handles the 401 → token exchange → retry flow automatically.
 */
async function registryFetch(
    registryUrl: string,
    path: string,
    auth: AuthConfig,
): Promise<Response> {
    const base = registryUrl.startsWith("http") ? registryUrl : `https://${registryUrl}`;
    const url = `${base}/v2/${path}`;

    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    // First attempt — may get 401
    let res = await fetch(url, { headers });

    if (res.status === 401) {
        const wwwAuth = res.headers.get("www-authenticate") || "";
        if (wwwAuth.toLowerCase().startsWith("bearer")) {
            const bearerToken = await fetchBearerToken(wwwAuth, auth);
            if (bearerToken) {
                headers["Authorization"] = `Bearer ${bearerToken}`;
                res = await fetch(url, { headers });
            }
        } else if (auth.username && auth.token) {
            // Basic auth fallback
            headers["Authorization"] = "Basic " + Buffer.from(`${auth.username}:${auth.token}`).toString("base64");
            res = await fetch(url, { headers });
        }
    }

    return res;
}

/**
 * List repositories in a registry (via /v2/_catalog).
 * Note: Docker Hub does not support this endpoint for most users.
 */
export async function listRepos(
    registryUrl: string,
    auth: AuthConfig,
    limit = 100,
): Promise<{ repositories: string[] }> {
    const res = await registryFetch(registryUrl, `_catalog?n=${limit}`, auth);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`catalog failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return res.json();
}

/**
 * List tags for a repository.
 */
export async function listTags(
    registryUrl: string,
    repository: string,
    auth: AuthConfig,
): Promise<{ name: string; tags: string[] }> {
    const res = await registryFetch(registryUrl, `${repository}/tags/list`, auth);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`tags list failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return res.json();
}

/**
 * Ping registry to verify connectivity and credentials.
 */
export async function pingRegistry(
    registryUrl: string,
    auth: AuthConfig,
): Promise<{ ok: boolean; error?: string }> {
    try {
        const res = await registryFetch(registryUrl, "", auth);
        if (res.ok || res.status === 200) return { ok: true };
        return { ok: false, error: `registry returned ${res.status}` };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
}

/**
 * Docker Registry V2 API proxy client.
 * Handles the WWW-Authenticate token dance for Docker Hub, GHCR, etc.
 *
 * Uses proxyFetch() so requests go through HTTP_PROXY when configured
 * (Node.js built-in fetch does not respect proxy env vars).
 */

import { proxyFetch } from "@/lib/proxyFetch";

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

    const res = await proxyFetch(url.toString(), { headers });
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
    let res = await proxyFetch(url, { headers });

    if (res.status === 401) {
        const wwwAuth = res.headers.get("www-authenticate") || "";
        if (wwwAuth.toLowerCase().startsWith("bearer")) {
            const bearerToken = await fetchBearerToken(wwwAuth, auth);
            if (bearerToken) {
                headers["Authorization"] = `Bearer ${bearerToken}`;
                res = await proxyFetch(url, { headers });
            }
        } else if (auth.username && auth.token) {
            // Basic auth fallback
            headers["Authorization"] = "Basic " + Buffer.from(`${auth.username}:${auth.token}`).toString("base64");
            res = await proxyFetch(url, { headers });
        }
    }

    return res;
}

/**
 * Detect whether a registry URL points to Docker Hub.
 */
function isDockerHub(registryUrl: string): boolean {
    const host = registryUrl.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
    return host === "registry-1.docker.io" || host === "docker.io" || host === "index.docker.io";
}

/**
 * Login to Docker Hub and resolve the actual namespace (username).
 * Docker Hub allows login with email, but the namespace is the username.
 * Returns { token, namespace } or null on failure.
 */
async function dockerHubLogin(auth: AuthConfig): Promise<{ token: string; namespace: string } | null> {
    if (!auth.username || !auth.token) return null;

    const loginRes = await proxyFetch("https://hub.docker.com/v2/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: auth.username, password: auth.token }),
    });
    if (!loginRes.ok) return null;

    const loginBody = await loginRes.json() as { token?: string };
    if (!loginBody.token) return null;

    // Resolve actual username (email != namespace)
    let namespace = auth.username.trim();
    const userRes = await proxyFetch("https://hub.docker.com/v2/user/", {
        headers: { Authorization: `Bearer ${loginBody.token}` },
    });
    if (userRes.ok) {
        const userBody = await userRes.json() as { username?: string };
        if (userBody.username) namespace = userBody.username;
    }

    return { token: loginBody.token, namespace };
}

/**
 * List repositories in a registry.
 *
 * Docker Hub does NOT support the standard v2/_catalog endpoint.
 * Instead, it uses hub.docker.com/v2/repositories/{namespace}/.
 * We detect Docker Hub and use the Hub API automatically.
 */
export async function listRepos(
    registryUrl: string,
    auth: AuthConfig,
    limit = 100,
): Promise<{ repositories: string[] }> {
    if (isDockerHub(registryUrl)) {
        return listDockerHubRepos(auth, limit);
    }

    const res = await registryFetch(registryUrl, `_catalog?n=${limit}`, auth);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`catalog failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return res.json();
}

/**
 * List repositories on Docker Hub via the Hub API.
 */
async function listDockerHubRepos(
    auth: AuthConfig,
    limit = 100,
): Promise<{ repositories: string[] }> {
    const headers: Record<string, string> = { Accept: "application/json" };
    let namespace = "library";

    const login = await dockerHubLogin(auth);
    if (login) {
        headers["Authorization"] = `Bearer ${login.token}`;
        namespace = login.namespace;
    }

    const url = `https://hub.docker.com/v2/repositories/${namespace}/?page_size=${limit}`;
    const res = await proxyFetch(url, { headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Docker Hub API failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = await res.json() as { results?: Array<{ name: string; namespace: string }> };
    const repos = (data.results || []).map(r => `${r.namespace}/${r.name}`);
    return { repositories: repos };
}

/**
 * List tags for a repository.
 */
export async function listTags(
    registryUrl: string,
    repository: string,
    auth: AuthConfig,
): Promise<{ name: string; tags: string[] }> {
    if (isDockerHub(registryUrl)) {
        return listDockerHubTags(repository, auth);
    }

    const res = await registryFetch(registryUrl, `${repository}/tags/list`, auth);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`tags list failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return res.json();
}

/**
 * List tags for a Docker Hub repository via the Hub API.
 */
async function listDockerHubTags(
    repository: string,
    auth: AuthConfig,
): Promise<{ name: string; tags: string[] }> {
    const repo = repository.includes("/") ? repository : `library/${repository}`;
    const headers: Record<string, string> = { Accept: "application/json" };

    const login = await dockerHubLogin(auth);
    if (login) {
        headers["Authorization"] = `Bearer ${login.token}`;
    }

    const url = `https://hub.docker.com/v2/repositories/${repo}/tags/?page_size=100&ordering=last_updated`;
    const res = await proxyFetch(url, { headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Docker Hub tags failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = await res.json() as { results?: Array<{ name: string }> };
    const tags = (data.results || []).map(t => t.name);
    return { name: repo, tags };
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

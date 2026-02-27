# ScanRook Platform (Web)

Web dashboard and API for ScanRook.

Core model:
- Local-first scanner CLI.
- Cloud enrichment and org workflows in the platform.

## User-facing URLs

- Marketing + install entrypoint: [https://scanrook.sh](https://scanrook.sh)
- Dashboard/API: [https://scanrook.io](https://scanrook.io)
- Installer script endpoint: [https://scanrook.sh/install](https://scanrook.sh/install)
- Installer script alias: [https://scanrook.sh/install.sh](https://scanrook.sh/install.sh)

## Local Development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build and Quality

```bash
npm run test:quality
npm run build
```

## Key Features in This App

- Auth (credentials + Google provider wiring).
- Org-scoped roles and API keys.
- Invite flows (`/api/org/invites*`).
- Admin override controls.
- Scan job history, findings, files, package explorer.
- OpenAPI JSON and Swagger UI.

## Installer Endpoint Behavior

`GET /install` and `GET /install.sh` return shell script content (`text/x-shellscript`) for:

```bash
curl -fsSL https://scanrook.sh/install | bash
```

## SEO and Link Preview Notes

`src/app/layout.tsx` sets:
- canonical metadata
- Open Graph metadata
- Twitter card metadata
- robots index/follow

If previews still look stale, purge CDN cache for `/` and re-share.

## Deploy Notes (Kubernetes)

- Image: `devintripp/deltaguard-ui:latest`
- Namespace: `deltaguard`
- Deployment: `deltaguard-web`

Typical rollout:

```bash
kubectl -n deltaguard rollout restart deployment/deltaguard-web
kubectl -n deltaguard rollout status deployment/deltaguard-web --timeout=300s
```

# syntax=docker/dockerfile:1.6

########################
# Build UI (this repo)
########################
FROM --platform=linux/amd64 node:22-bookworm-slim AS ui-build
WORKDIR /app

ARG http_proxy
ARG https_proxy
ENV http_proxy=${http_proxy}
ENV https_proxy=${https_proxy}

# Install deps first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the UI source
COPY . .

# Prisma (adjust path if your schema lives elsewhere)
RUN npx prisma generate --schema=prisma/schema.prisma

# Build the UI
ENV NODE_ENV=production
RUN npm run build

FROM --platform=linux/amd64 node:22-bookworm-slim
WORKDIR /app

# Copy built UI app and any runtime files
COPY --from=ui-build /app ./

# Ensure entrypoint script is LF and executable in the image
# (git can keep it +x; this line is still safe)
RUN chmod 0755 /app/entrypoint.sh

# Reasonable defaults
ENV NODE_ENV=production \
    SCANNER_NVD_TTL_DAYS=7 \
    SCANNER_NVD_CONC=5 \
    NO_PROXY=".svc,.svc.cluster.local,.cluster.local,10.96.0.0/12,10.0.0.0/8,192.168.0.0/16,172.16.0.0/12" \
    no_proxy=".svc,.svc.cluster.local,.cluster.local,10.96.0.0/12,10.0.0.0/8,192.168.0.0/16,172.16.0.0/12"

# Drop privileges
RUN useradd -r -u 10001 -g nogroup appuser && chown -R appuser:nogroup /app
USER appuser

EXPOSE 3000

# *** Critical: clear Node’s default ENTRYPOINT ***
ENTRYPOINT []

# Run your script directly
CMD ["/app/entrypoint.sh"]



# crictl run \
#     -e GITEA_INSTANCE_URL=https://gitea.apps.onetripp.com \
#     -e GITEA_RUNNER_REGISTRATION_TOKEN=xTItao9JN9qElomix65A8ARxZ7Rh4rXzZI4lLT34 \
#     -e GITEA_RUNNER_NAME=deltaguard-runner \
#     --name deltaguard-runner \
#     -d docker.io/gitea/act_runner:latest

# crictl run --entrypoint="" --rm -it docker.io/gitea/act_runner:latest act_runner generate-config > config.yaml

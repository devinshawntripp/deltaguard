# syntax=docker/dockerfile:1.6

########################
# Build UI (this repo)
########################
FROM --platform=linux/amd64 node:22-alpine AS ui-build
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

# Prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# Build the UI — inject version info at build time
ARG APP_VERSION=dev
ARG APP_COMMIT=unknown
ENV NODE_ENV=production
ENV APP_VERSION=${APP_VERSION}
ENV APP_COMMIT=${APP_COMMIT}
RUN npm run build

########################
# Runtime — standalone output (no node_modules bloat)
########################
FROM --platform=linux/amd64 node:22-alpine
WORKDIR /app

# Next.js standalone output includes only the files needed to run.
# This eliminates unused transitive dependencies (babel-traverse,
# minimist, lodash, etc.) that would otherwise show up as vulns.
COPY --from=ui-build /app/.next/standalone ./
COPY --from=ui-build /app/.next/static ./.next/static
COPY --from=ui-build /app/public ./public
COPY --from=ui-build /app/prisma ./prisma
COPY --from=ui-build /app/entrypoint.sh ./entrypoint.sh

# Ensure entrypoint script is executable
RUN chmod 0755 /app/entrypoint.sh

# Reasonable defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    SCANNER_NVD_TTL_DAYS=7 \
    SCANNER_NVD_CONC=5 \
    NO_PROXY=".svc,.svc.cluster.local,.cluster.local,10.96.0.0/12,10.0.0.0/8,192.168.0.0/16,172.16.0.0/12" \
    no_proxy=".svc,.svc.cluster.local,.cluster.local,10.96.0.0/12,10.0.0.0/8,192.168.0.0/16,172.16.0.0/12"

# Drop privileges
RUN adduser -D -u 10001 appuser && chown -R appuser:nogroup /app
USER appuser

EXPOSE 3000

ENTRYPOINT []
# Standalone mode — server.js is the self-contained Next.js server.
# Schema bootstrap happens in-code via ensurePlatformSchema() on first request.
CMD ["node", "server.js"]

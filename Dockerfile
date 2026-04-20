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

# Prisma (adjust path if your schema lives elsewhere)
RUN npx prisma generate --schema=prisma/schema.prisma

# Build the UI — inject version info at build time
ARG APP_VERSION=dev
ARG APP_COMMIT=unknown
ENV NODE_ENV=production
ENV APP_VERSION=${APP_VERSION}
ENV APP_COMMIT=${APP_COMMIT}
RUN npm run build

########################
# Runtime (Alpine-based — minimal attack surface)
########################
FROM --platform=linux/amd64 node:22-alpine
WORKDIR /app

# Copy built UI app and any runtime files
COPY --from=ui-build /app ./

# Ensure entrypoint script is executable
RUN chmod 0755 /app/entrypoint.sh

# Reasonable defaults
ENV NODE_ENV=production \
    SCANNER_NVD_TTL_DAYS=7 \
    SCANNER_NVD_CONC=5 \
    NO_PROXY=".svc,.svc.cluster.local,.cluster.local,10.96.0.0/12,10.0.0.0/8,192.168.0.0/16,172.16.0.0/12" \
    no_proxy=".svc,.svc.cluster.local,.cluster.local,10.96.0.0/12,10.0.0.0/8,192.168.0.0/16,172.16.0.0/12"

# Drop privileges (Alpine uses adduser syntax)
RUN adduser -D -u 10001 appuser && chown -R appuser:nogroup /app
USER appuser

EXPOSE 3000

# *** Critical: clear Node's default ENTRYPOINT ***
ENTRYPOINT []

# Run your script directly
CMD ["/app/entrypoint.sh"]

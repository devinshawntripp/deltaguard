# syntax=docker/dockerfile:1.6

########################
# Build Rust scanner (external repo)
########################
FROM rust:1.83-slim AS scanner-build
WORKDIR /src

ARG http_proxy
ARG https_proxy
ENV http_proxy=${http_proxy}
ENV https_proxy=${https_proxy}

# Bring in the scanner repo via a separate build context
COPY --from=scanner_src / /src

# HARD FAIL if the external context didn't arrive
RUN test -f Cargo.toml || (echo >&2 "ERROR: scanner_src context missing (no Cargo.toml). Did you pass --build-context scanner_src=?"; exit 1)

# Build deps (+ file so we can validate the binary)
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev ca-certificates build-essential curl file \
    && rm -rf /var/lib/apt/lists/*


# (Safe) warm the Cargo index/deps without touching your sources
RUN cargo fetch --locked

# Build and install to /usr/local/bin/scanner
RUN cargo install --path . --root /usr/local --locked

# Sanity checks: exists, looks like amd64 ELF, and is > 500KB
RUN set -e; \
    test -x /usr/local/bin/scanner || { echo "scanner missing"; exit 1; }; \
    file /usr/local/bin/scanner | grep -E 'ELF 64-bit.*x86-64' >/dev/null || { echo "scanner not amd64 ELF"; exit 1; }; \
    BYTES=$(wc -c </usr/local/bin/scanner || echo 0); \
    if [ "$BYTES" -lt 500000 ]; then echo "scanner too small ($BYTES bytes) — likely a stub"; exit 1; fi; \
    # soft probe; don’t fail if it returns non-zero (clap can do that)
    /usr/local/bin/scanner --help >/dev/null 2>&1 || echo "note: scanner ran (non-zero exit, ok)"



########################
# Build UI (this repo)
########################
FROM --platform=linux/amd64 node:20-bookworm-slim AS ui-build
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

FROM node:20-bookworm-slim
WORKDIR /app

# Minimal runtime deps for scanner
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libssl3 rpm \
    && rm -rf /var/lib/apt/lists/*

# Copy scanner binary built from external repo
COPY --from=scanner-build /usr/local/bin/scanner /usr/local/bin/scanner

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

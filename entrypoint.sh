#!/usr/bin/env sh
set -e

echo "Running Prisma migrations..."
# If migrate deploy fails (no migrations yet), fall back to schema sync
npx prisma migrate deploy || npx prisma db push

echo "Starting app..."
exec npm run start
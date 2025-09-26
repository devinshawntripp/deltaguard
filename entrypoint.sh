#!/usr/bin/env sh
set -e
echo "Running Prisma migrations..."
npx prisma migrate deploy || npx prisma db push
echo "Starting app..."
exec npm run start

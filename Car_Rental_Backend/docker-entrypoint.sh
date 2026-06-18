#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
npx prisma migrate deploy

echo "[entrypoint] Seeding database..."
node dist/prisma/seed.js

echo "[entrypoint] Starting application..."
exec node dist/src/index.js
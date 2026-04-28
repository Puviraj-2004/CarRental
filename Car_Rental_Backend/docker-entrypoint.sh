#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
npx prisma migrate deploy

echo "[entrypoint] Migrations complete. Starting application..."
exec node dist/src/index.js
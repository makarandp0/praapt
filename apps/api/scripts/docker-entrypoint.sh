#!/bin/sh
set -e

echo "=== Starting API Service ==="

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  node dist/migrate.js
  echo "Migrations complete."
else
  echo "Warning: DATABASE_URL not set, skipping migrations."
fi

echo "Starting application..."
exec node dist/index.js

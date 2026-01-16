#!/bin/sh
set -e

# Ensure the data directory exists
mkdir -p /app/data

# Push database schema (idempotent - safe to run on every startup)
echo "Ensuring database schema is up to date..."
npm run db:push
echo "Database schema check complete."

# Start the Next.js server
exec node server.js


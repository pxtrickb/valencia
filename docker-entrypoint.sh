#!/bin/sh
set -e

# Create directories if they don't exist (needed for volume mounts)
mkdir -p /app/usercontent
mkdir -p /app/src/db

# Check if database file exists, if not create it
if [ ! -f "/app/src/db/local.db" ]; then
  echo "Database file not found. Creating database using drizzle-kit..."
  npm run db:push
  echo "Database created successfully."
else
  echo "Database file already exists. Skipping creation."
fi

# Start the Next.js server
exec node server.js


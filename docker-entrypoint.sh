#!/bin/sh
set -e

echo "=== Starting container entrypoint ==="

# Ensure persistent directories exist with correct permissions
echo "Ensuring persistent directories exist..."
mkdir -p /app/data /app/usercontent/images

# Ensure directories are writable (in case volume mount changed permissions)
# Note: This will work even if directories are mounted as volumes
chmod 755 /app/data /app/usercontent 2>/dev/null || true
chmod -R 755 /app/usercontent 2>/dev/null || true

# Verify DB_FILE_NAME is set
if [ -z "$DB_FILE_NAME" ]; then
  echo "ERROR: DB_FILE_NAME environment variable is not set!"
  exit 1
fi

echo "DB_FILE_NAME is set to: $DB_FILE_NAME"

# Check if drizzle-kit is available
if [ ! -f "./node_modules/.bin/drizzle-kit" ]; then
  echo "ERROR: drizzle-kit not found in node_modules/.bin!"
  echo "Checking node_modules..."
  ls -la node_modules/.bin/ 2>&1 | head -20 || echo "node_modules/.bin does not exist"
  echo "Checking for drizzle-kit..."
  find node_modules -name "drizzle-kit" -type f 2>&1 | head -5 || echo "drizzle-kit not found"
  exit 1
fi

echo "✓ drizzle-kit found at: ./node_modules/.bin/drizzle-kit"

# Push database schema (idempotent - safe to run on every startup)
echo "=== Running database schema migration ==="
echo "Current directory: $(pwd)"
echo "Checking drizzle.config.ts..."
if [ ! -f "./drizzle.config.ts" ]; then
  echo "ERROR: drizzle.config.ts not found!"
  exit 1
fi
echo "✓ drizzle.config.ts found"

echo "Checking schema.ts..."
if [ ! -f "./src/db/schema.ts" ]; then
  echo "ERROR: src/db/schema.ts not found!"
  exit 1
fi
echo "✓ schema.ts found"

# Run drizzle-kit push directly using npx to ensure it uses the installed version
if npx drizzle-kit push; then
  echo "✓ Database schema migration completed successfully"
else
  echo "ERROR: Database schema migration failed with exit code $?"
  exit 1
fi

# Verify database file was created
if [ -f "$DB_FILE_NAME" ]; then
  echo "✓ Database file exists at: $DB_FILE_NAME"
  ls -lh "$DB_FILE_NAME"
else
  echo "WARNING: Database file was not created at: $DB_FILE_NAME"
fi

echo "=== Starting Next.js server ==="
exec node server.js


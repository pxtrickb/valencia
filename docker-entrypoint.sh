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

# Extract actual file path from DB_FILE_NAME (handle file: protocol)
# For SQLite files, drizzle-orm/libsql uses "file:" prefix, but drizzle-kit needs raw path
# Also handle relative paths - convert to absolute if needed
DB_PATH="$DB_FILE_NAME"
if [ "${DB_PATH#file:}" != "$DB_PATH" ]; then
  # Remove file: prefix
  DB_PATH="${DB_PATH#file:}"
fi

# Convert relative paths to absolute
case "$DB_PATH" in
  /*) 
    # Already absolute
    DB_ACTUAL_PATH="$DB_PATH"
    ;;
  *)
    # Relative path - make it absolute based on /app
    DB_ACTUAL_PATH="/app/$DB_PATH"
    # Remove any .// or ./ prefixes
    DB_ACTUAL_PATH=$(echo "$DB_ACTUAL_PATH" | sed 's|/\./|/|g' | sed 's|\./||g')
    ;;
esac

echo "Actual database file path: $DB_ACTUAL_PATH"
echo "Database directory: $(dirname "$DB_ACTUAL_PATH")"

# Ensure the database directory exists
DB_DIR=$(dirname "$DB_ACTUAL_PATH")
mkdir -p "$DB_DIR"

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
# Note: drizzle.config.ts will use process.env.DB_FILE_NAME which should be the absolute path
# For drizzle-kit with SQLite, we need to ensure it's using the absolute path without file: prefix
export DB_FILE_NAME="$DB_ACTUAL_PATH"

if npx drizzle-kit push; then
  echo "✓ Database schema migration completed successfully"
else
  echo "ERROR: Database schema migration failed with exit code $?"
  exit 1
fi

# Verify database file was created
if [ -f "$DB_ACTUAL_PATH" ]; then
  echo "✓ Database file exists at: $DB_ACTUAL_PATH"
  ls -lh "$DB_ACTUAL_PATH"
else
  echo "WARNING: Database file was not created at: $DB_ACTUAL_PATH"
  echo "Checking directory contents:"
  ls -la "$DB_DIR" 2>&1 || echo "Directory does not exist or is not accessible"
fi

echo "=== Starting Next.js server ==="
exec node server.js


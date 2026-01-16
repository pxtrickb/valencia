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
# IMPORTANT: In Docker, we should always use /app/data/local.db as per docker-compose.yml
# If the path is relative or wrong, force it to the correct location
case "$DB_PATH" in
  /*) 
    # Already absolute - but check if it's the wrong location
    if [ "$DB_PATH" != "/app/data/local.db" ]; then
      echo "WARNING: DB_FILE_NAME path ($DB_PATH) doesn't match expected location (/app/data/local.db)"
      echo "Using expected location: /app/data/local.db"
      DB_ACTUAL_PATH="/app/data/local.db"
    else
      DB_ACTUAL_PATH="$DB_PATH"
    fi
    ;;
  *)
    # Relative path - use the expected Docker location
    echo "Relative path detected, using Docker volume location: /app/data/local.db"
    DB_ACTUAL_PATH="/app/data/local.db"
    ;;
esac

echo "Actual database file path: $DB_ACTUAL_PATH"
echo "Database directory: $(dirname "$DB_ACTUAL_PATH")"

# Ensure the database directory exists
DB_DIR=$(dirname "$DB_ACTUAL_PATH")
mkdir -p "$DB_DIR"

# Check if drizzle-kit is available (try multiple locations)
DRIZZLE_KIT_PATH=""
DRIZZLE_KIT_CMD=""

# First check if it's available as a command (global or in PATH)
if command -v drizzle-kit >/dev/null 2>&1; then
  DRIZZLE_KIT_PATH=$(command -v drizzle-kit)
  DRIZZLE_KIT_CMD="drizzle-kit"
  echo "✓ drizzle-kit found in PATH: $DRIZZLE_KIT_PATH"
elif [ -f "./node_modules/.bin/drizzle-kit" ]; then
  DRIZZLE_KIT_PATH="./node_modules/.bin/drizzle-kit"
  DRIZZLE_KIT_CMD="./node_modules/.bin/drizzle-kit"
  echo "✓ drizzle-kit found in local node_modules/.bin"
else
  # Try to find it in node_modules (might be a JS file)
  DRIZZLE_KIT_PATH=$(find node_modules -name "drizzle-kit" -type f -executable 2>/dev/null | head -1)
  if [ -n "$DRIZZLE_KIT_PATH" ]; then
    DRIZZLE_KIT_CMD="$DRIZZLE_KIT_PATH"
    echo "✓ drizzle-kit found at: $DRIZZLE_KIT_PATH"
  else
    # Try to find the JS file
    DRIZZLE_KIT_PATH=$(find node_modules -path "*/drizzle-kit/dist/cli.js" -type f 2>/dev/null | head -1)
    if [ -n "$DRIZZLE_KIT_PATH" ]; then
      DRIZZLE_KIT_CMD="node $DRIZZLE_KIT_PATH"
      echo "✓ drizzle-kit found as JS file: $DRIZZLE_KIT_PATH"
    fi
  fi
fi

if [ -z "$DRIZZLE_KIT_CMD" ]; then
  echo "ERROR: drizzle-kit not found!"
  echo "Checking node_modules/.bin..."
  ls -la node_modules/.bin/ 2>&1 | head -20 || echo "node_modules/.bin does not exist"
  echo "Checking for drizzle-kit in node_modules..."
  find node_modules -name "*drizzle-kit*" -type f 2>&1 | head -10 || echo "drizzle-kit not found"
  echo "Checking npm bin..."
  npm bin 2>&1 || true
  echo "Checking global npm packages..."
  npm list -g drizzle-kit 2>&1 | head -5 || true
  exit 1
fi

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

# Ensure PATH includes node_modules/.bin for npx to find drizzle-kit
export PATH="/app/node_modules/.bin:$PATH"

echo "Using DB_FILE_NAME: $DB_FILE_NAME for drizzle-kit push"

# Try to run drizzle-kit push
# First try npx, then fall back to direct command
if npx --yes drizzle-kit push 2>&1; then
  echo "✓ Database schema migration completed successfully"
elif [ -n "$DRIZZLE_KIT_CMD" ]; then
  echo "npx failed, trying direct command: $DRIZZLE_KIT_CMD"
  if $DRIZZLE_KIT_CMD push; then
    echo "✓ Database schema migration completed successfully"
  else
    echo "ERROR: Database schema migration failed with exit code $?"
    exit 1
  fi
else
  echo "ERROR: Cannot run drizzle-kit push - no drizzle-kit found"
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


# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables (if needed)
# You can override these during build if necessary
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache libc6-compat

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json for npm scripts (needed for drizzle-kit)
COPY --from=builder /app/package.json ./package.json

# Install drizzle-kit and required dependencies for database migrations
# Install into the app directory (which includes the standalone's node_modules)
# Note: @libsql/client is needed for the database connection, and dotenv for config
# Install as root before switching users
# Install both locally and globally as a fallback
RUN npm install --omit=dev drizzle-kit tsx better-sqlite3 drizzle-orm @libsql/client dotenv --legacy-peer-deps && \
    npm install -g drizzle-kit --legacy-peer-deps || true && \
    echo "drizzle-kit check: $(which drizzle-kit || echo 'not in PATH')" && \
    echo "local node_modules: $(find node_modules -name drizzle-kit -type f 2>/dev/null | head -1 || echo 'not found locally')"

# Copy database schema and config files needed for migrations
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src/db/schema.ts ./src/db/schema.ts

# Copy entrypoint script
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Create persistent directories for data and user content
# These will be mounted as volumes in docker-compose.yml
RUN mkdir -p /app/data /app/usercontent/images

# Make entrypoint script executable
RUN chmod +x ./docker-entrypoint.sh

# Set correct permissions for the entire app directory
# This ensures nextjs user can read/write to all directories
RUN chown -R nextjs:nodejs /app

# Declare volumes for persistence (data directory for database, usercontent for uploaded files)
# Note: These are mounted from docker-compose.yml but declaring them documents intent
VOLUME ["/app/data", "/app/usercontent"]

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]


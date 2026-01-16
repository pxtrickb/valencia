# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# ================================
# DEPS
# ================================
FROM base AS deps
# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ================================
# BUILDER
# ================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ================================
# RUNNER
# ================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
#ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install build tools for native modules and drizzle-kit
RUN apk add libc6-compat python3 make g++

# Copy node_modules and package.json
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Install drizzle-kit for migrations (needed for db:push at runtime)
# Using --no-save to avoid modifying package.json
RUN npm install --no-save drizzle-kit && \
    # Clean up build tools to reduce image size (keep libc6-compat for runtime)
    apk del python3 make g++

# Create directories for volumes
RUN mkdir -p ./usercontent/images ./src/db && \
    chown -R nextjs:nodejs ./usercontent ./src/db

# Create entrypoint script to initialize database if needed
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo 'DB_PATH="${DB_FILE_NAME:-./src/db/local.db}"' >> /entrypoint.sh && \
    echo '# Remove file: prefix if present for file existence check' >> /entrypoint.sh && \
    echo 'DB_FILE="${DB_PATH#file:}"' >> /entrypoint.sh && \
    echo 'if [ ! -f "$DB_FILE" ]; then' >> /entrypoint.sh && \
    echo '  echo "Database not found at $DB_FILE. Initializing database..."' >> /entrypoint.sh && \
    echo '  npm run db:push || echo "Warning: Database initialization failed. Continuing anyway..."' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '  echo "Database found at $DB_FILE"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh && \
    chown nextjs:nodejs /entrypoint.sh

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set volumes for persistent data
VOLUME ["./usercontent", "./src/db"]

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
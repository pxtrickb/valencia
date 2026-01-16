# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# ================================
# DEPS
# ================================
# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --legacy-peer-deps

# ================================
# BUILDER
# ================================
# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run build
RUN npm run build

# ================================
# RUNNER
# ================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Add group and user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create directories for persistent volumes
RUN mkdir -p /app/usercontent /app/src/db && \
    chown -R nextjs:nodejs /app/usercontent /app/src/db

# Copy needed files
COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy files needed for database initialization (drizzle-kit)
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs drizzle.config.ts ./
COPY --chown=nextjs:nodejs src/db/schema.ts ./src/db/schema.ts
COPY --chown=nextjs:nodejs package.json ./

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["./docker-entrypoint.sh"]
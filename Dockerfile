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

# Copy package.json for npm scripts
COPY --from=builder /app/package.json ./package.json

# Install drizzle-kit and required dependencies for database migrations
RUN npm install --omit=dev drizzle-kit tsx better-sqlite3 drizzle-orm

# Copy database schema and config files needed for migrations
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src/db/schema.ts ./src/db/schema.ts

# Copy entrypoint script
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Copy usercontent directory structure (empty, will be mounted as volume)
RUN mkdir -p usercontent/images
# Create data directory for database
RUN mkdir -p data

# Make entrypoint script executable
RUN chmod +x ./docker-entrypoint.sh

# Set correct permissions (must be done before switching users)
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]


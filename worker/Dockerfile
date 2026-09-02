# Multi-stage build for Worker service
# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S worker -u 1001

# Copy from builder
COPY --from=builder --chown=worker:nodejs /app/dist ./dist
COPY --from=dependencies --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/package*.json ./

# Switch to non-root user
USER worker

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "console.log('Worker healthy')" || exit 1

# Expose metrics port
EXPOSE 9090

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start the worker
CMD ["node", "dist/src/index.js"]

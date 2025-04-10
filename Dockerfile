FROM node:20-slim as builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY functions/package.json functions/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY functions/ ./
RUN pnpm run build

# Production stage
FROM node:20-slim

# Install only the required dependencies for Puppeteer/Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libfontconfig1 \
    libgdk-pixbuf2.0-0 \
    libxss1 \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm (production only)
RUN npm install -g pnpm

# Copy build artifacts and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create assets directory
RUN mkdir -p /app/assets
COPY assets/ /app/assets/

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV ASSETS_PATH=/app/assets
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health/liveness || exit 1

# Start the application
CMD ["node", "--experimental-specifier-resolution=node", "dist/index.js"] 
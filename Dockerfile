FROM node:22.12-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Setup pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# 1. Block all automatic scripts
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV pnpm_config_ignore_scripts=true

# 2. Copy the structure first
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
COPY apps/api/prisma ./prisma

# 3. CRITICAL: Physically copy the Prisma folder specifically 
# This ensures Docker "sees" the file before we install anything
# COPY apps/api/prisma ./apps/api/prisma

# 4. Install dependencies (scripts ignored)
RUN pnpm install --frozen-lockfile --ignore-scripts

# 5. Install with ignore-scripts to skip that broken postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

# 6. Copy the rest of the source code
COPY . .

# 7. MANUALLY Generate Prisma Client
# We use npx to ensure it finds the hoisted prisma binary
RUN cd apps/api && DATABASE_URL="postgresql://unused:unused@localhost:5432/unused" npx prisma generate

# 8. Build the API
RUN pnpm --filter api run build

EXPOSE 3000

# 9. RUNTIME
WORKDIR /app/apps/api
RUN ls -R

# Add this line to start your NestJS app
CMD ["/bin/sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]
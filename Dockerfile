# ===== Base image =====
FROM node:22.12-slim

# ===== Install system dependencies =====
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# ===== Enable pnpm =====
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ===== Set workspace root =====
WORKDIR /app

# ===== Copy monorepo files =====
# We copy the workspace config first to leverage Docker layer caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# CRITICAL: We MUST copy packages/ because apps/api depends on @repo/types
COPY packages ./packages
COPY apps/api ./apps/api

# ===== Install dependencies =====
RUN pnpm install --frozen-lockfile

# ===== Generate Prisma client & Build API =====
# 'api...' builds the api AND all its local workspace dependencies in order
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api... build

# ===== Set working directory for runtime =====
# Keeping this as /app so paths to dist/apps/api are predictable
WORKDIR /app

# ===== Expose port =====
EXPOSE 3000

# ===== Runtime command =====
# We use the explicit path to the built main.js discovered earlier
CMD ["/bin/sh", "-c", "pnpm --filter api exec prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node dist/apps/api/main.js"]
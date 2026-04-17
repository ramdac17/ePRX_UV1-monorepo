# ===== Base image =====
FROM node:22.12-slim

# ===== Install system dependencies =====
# Prisma needs openssl to run inside the container
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# ===== Enable pnpm =====
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# ===== Set workspace root =====
WORKDIR /app

# ===== Copy monorepo configuration =====
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# We need the package.json from every workspace to let pnpm link them correctly
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# ===== Install dependencies =====
# Use --no-frozen-lockfile since we've been modifying dependencies recently
RUN pnpm install --no-frozen-lockfile

# ===== Copy source code =====
# We do this AFTER install to leverage Docker layer caching
COPY packages ./packages
COPY apps/api ./apps/api

# ===== Generate Prisma client =====
# Move into the specific app folder so Prisma can see its own @prisma/client
RUN cd apps/api && npx prisma generate

# ===== Build API =====
RUN pnpm --filter api build

# ===== Expose port =====
EXPOSE 3000

# ===== Runtime command =====
# Note: Check if your dist path is actually dist/apps/api/src/main.js 
# In many Nest monorepos, it's just dist/apps/api/main.js
CMD ["sh", "-c", "cd apps/api && pnpm exec prisma migrate deploy && node ../../dist/apps/api/main.js"]
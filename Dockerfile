# ===== Base image =====
FROM node:22.12-slim

# ===== Install system dependencies =====
# Prisma and Canvas-related logic need these libraries
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# ===== Enable pnpm =====
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# ===== Set workspace root =====
WORKDIR /app

# ===== Copy monorepo configuration =====
# Copy only the essentials first for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# ===== Install dependencies =====
RUN pnpm install --no-frozen-lockfile

# ===== Copy source code =====
# Now copy the actual code (including fonts for Satori)
COPY packages ./packages
COPY apps/api ./apps/api

# ===== Generate Prisma client =====
# This creates the types needed for the build to pass
RUN cd apps/api && npx prisma generate

# ===== Build API =====
# This creates the 'dist' folder
RUN pnpm --filter api build

# ===== Final Path Diagnostics (Visible in Railway Build Logs) =====
# This helps us see exactly where Nest put the files
RUN find . -name "main.js" -path "*/dist/*"

# ===== Expose port =====
EXPOSE 3000

# ===== Runtime command =====
# 1. Run migrations
# 2. Use a dynamic search to find and run main.js (handles monorepo path variance)
CMD ["sh", "-c", "cd apps/api && pnpm exec prisma migrate deploy && node $(find /app -name main.js | grep dist | head -n 1)"]
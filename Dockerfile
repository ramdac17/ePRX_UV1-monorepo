# ===== Base image =====
FROM node:22.12-slim

# ===== Install system dependencies =====
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# ===== Enable pnpm =====
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ===== Set workspace root =====
WORKDIR /app

# ===== Copy monorepo files =====
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# ===== Install dependencies =====
RUN pnpm install --frozen-lockfile

# ===== Generate Prisma client =====
RUN pnpm --filter api exec prisma generate

# ===== Build API =====
RUN pnpm --filter api build

# ===== Expose port =====
EXPOSE 3000

# ===== Runtime command =====
CMD cd apps/api && \
    echo "Starting API............." && \
    pnpm exec prisma migrate deploy && \
    echo "Running Nest............." && \
    node dist/apps/api/src/main.js
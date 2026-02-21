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
COPY apps/api ./apps/api
COPY packages ./packages

# ===== Install dependencies =====
RUN pnpm install --frozen-lockfile

# ===== Generate Prisma client & build API =====
RUN pnpm --filter api exec prisma generate -- --schema=./apps/api/prisma/schema.prisma \
    && pnpm --filter api run build --filter api

# ===== Set working directory for runtime =====
WORKDIR /app/apps/api

# ===== Expose port =====
EXPOSE 3000

# ===== Runtime command =====
CMD ["/bin/sh", "-c", "pnpm exec prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]
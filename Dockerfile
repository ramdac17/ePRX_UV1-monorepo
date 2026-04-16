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

# ==== Linux libs =====

RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libxfixes3 \
    libxext6 \
    libxrender1 \
    libnspr4 \
    && rm -rf /var/lib/apt/lists/*

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
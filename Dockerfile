FROM node:22.12-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# --- THE KEY CHANGE ---
# Stop Prisma from running 'postinstall' during pnpm install
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

COPY . .

# Now run generate MANUALLY with the correct path
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

RUN pnpm run build:api
EXPOSE 3000
CMD ["pnpm", "run", "start:api"]
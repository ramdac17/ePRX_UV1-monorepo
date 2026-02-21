FROM node:22.12-slim

RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /apps

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api ./apps/api
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client & build API
RUN pnpm --filter api exec prisma generate -- --schema=./apps/api/prisma/schema.prisma \
    && pnpm --filter api run build --filter api

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["/bin/sh", "-c", "pnpm --filter api exec prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]
FROM node:22.12-slim

RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app/apps/api

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api run build

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["/bin/sh", "-c", "sleep 5 && pnpm exec prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]

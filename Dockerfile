FROM node:22.12-slim

RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV pnpm_config_ignore_scripts=true

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile --ignore-scripts

RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api run build
RUN ls -R apps/api/prisma

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/main.js"]


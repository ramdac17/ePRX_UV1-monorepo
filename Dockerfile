FROM node:22.12-slim AS base
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Disable ALL automatic scripts during the initial install
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Use --ignore-scripts to stop the "file not found" loop
RUN pnpm install --frozen-lockfile --ignore-scripts

# Now copy the rest of the source
COPY . .

# Manually generate the client now that the files are definitely there
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the API (Turbo will handle the sub-dependencies)
RUN pnpm run build:api

EXPOSE 3000
CMD ["pnpm", "run", "start:api"]
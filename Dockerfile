# Use the exact Node version Prisma 7 demands
FROM node:22.12-slim AS base

# Install OpenSSL and other Prisma dependencies
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy only the files needed for pnpm install (faster caching)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Generate Prisma Client (crucial for monorepos)
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the API
RUN pnpm run build:api

# Expose the port Railway expects
EXPOSE 3000

# Start command
CMD ["pnpm", "run", "start:api"]
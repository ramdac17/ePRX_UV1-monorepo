FROM node:22.12-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Setup pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# 1. Block all automatic scripts
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV pnpm_config_ignore_scripts=true

# 2. Copy the structure first
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# 3. CRITICAL: Physically copy the Prisma folder specifically 
# This ensures Docker "sees" the file before we install anything
COPY apps/api/prisma ./apps/api/prisma

# 4. Install dependencies (scripts ignored)
RUN pnpm install --frozen-lockfile --ignore-scripts

# 5. Copy the rest of the source code
COPY . .

# 6. Generate - explicitly in the context of the api folder
RUN cd apps/api && DATABASE_URL="postgresql://unused:unused@localhost:5432/unused" npx prisma generate

# 7. Build the NestJS app
RUN pnpm --filter api run build

# 8. Expose the port
EXPOSE 3000

# 9. THE FINAL MOVES: 
# Move into the api directory so the 'prisma' command finds the schema at 'prisma/schema.prisma'
WORKDIR /app/apps/api

# Run migrations using the binary we confirmed is in dependencies, then start the server
CMD ["sh", "-c", "../../node_modules/.bin/prisma migrate deploy && node dist/main.js"]
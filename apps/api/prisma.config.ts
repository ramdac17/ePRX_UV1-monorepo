import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './apps/api/prisma/schema.prisma', // ✅ correct from monorepo root
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

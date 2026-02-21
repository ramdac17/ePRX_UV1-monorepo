import { defineConfig } from 'prisma/config';
export default defineConfig({
    schema: './prisma/schema.prisma', // ✅ always relative to apps/api
    datasource: {
        url: process.env.DATABASE_URL,
    },
});

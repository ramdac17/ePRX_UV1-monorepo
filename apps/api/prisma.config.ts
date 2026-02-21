import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Switch from env('DATABASE_URL') to process.env.DATABASE_URL
    url: process.env.DATABASE_URL,
  },
});

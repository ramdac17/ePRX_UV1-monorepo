import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('PRX_DATABASE_CORE');

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      // During build/generate phases, DATABASE_URL might be undefined.
      // We log it but continue so the constructor doesn't throw a hard error immediately.
      console.warn('DATABASE_URL is not defined in environment variables.');
    }

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    // Pass the adapter to the parent PrismaClient
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Uplink Established: Postgres Driver Adapter Connected.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database Connection Failed: ${message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.warn('Uplink Severed: Database Disconnected.');
  }
}

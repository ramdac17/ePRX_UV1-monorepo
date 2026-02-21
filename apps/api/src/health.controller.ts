import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Pings the database
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        project: 'ePRX UV1',
      };
    } catch (e) {
      return {
        status: 'error',
        database: 'disconnected',
        message: e.message,
      };
    }
  }
}

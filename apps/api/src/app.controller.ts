import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import type { CreateFeedbackDto } from '@repo/types';

@Controller('status')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get()
  getHello(): string {
    return '📡 ePRX_UV1_UPLINK_ESTABLISHED: SYSTEM_STATUS_OPTIMAL';
  }

  @Get('status')
  getStatus() {
    return {
      data: { version: '1.0.0' },
      message: 'API is online',
      statusCode: 200,
    };
  }
}

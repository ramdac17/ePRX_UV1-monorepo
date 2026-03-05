import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
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

  @Get()
  getStatus() {
    return {
      data: { version: '1.0.0' },
      message: 'API is online',
      statusCode: 200,
    };
  }

  @Post('feedback')
  async receiveFeedback(@Body() dto: CreateFeedbackDto) {
    console.log('Saving to Postgres...', dto);
    const result = await this.prismaService.feedback.create({
      data: {
        name: dto.name,
        message: dto.message,
      },
    });

    return {
      message: 'Saved!',
      id: result.id,
      statusCode: 201,
    };
  }
}

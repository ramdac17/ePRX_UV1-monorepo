import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  NotFoundException, // Add this
} from '@nestjs/common';
import { ActivitiesService } from './activities.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.getDashboardStats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async uploadActivity(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.createActivity(userId, body);
  }

  // 🌏 PUBLIC: Moved above 'user/:userId' to ensure it's the primary wildcard
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // 💡 LOG: This will show up in Railway Logs
    console.log(`[API] Attempting to find activity with ID: ${id}`);

    const activity = await this.activitiesService.findOne(id);

    // 💡 CRITICAL: If the DB returns null, NestJS doesn't always throw 404 by default
    if (!activity) {
      console.error(`[API] Activity ${id} not found in Database.`);
      throw new NotFoundException(`Mission ${id} not found.`);
    }

    return activity;
  }

  @Get('user/:userId')
  async getHistory(@Param('userId') userId: string) {
    return this.activitiesService.findAll(userId);
  }
}

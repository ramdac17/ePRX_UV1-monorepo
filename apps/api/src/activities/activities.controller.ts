import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // 🔒 PRIVATE: Dashboard stats needs a login
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.getDashboardStats(userId);
  }

  // 🔒 PRIVATE: The general list needs a login
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.findAll(userId);
  }

  // 🔒 PRIVATE: Creating an activity needs a login
  @UseGuards(JwtAuthGuard)
  @Post()
  async uploadActivity(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.createActivity(userId, body);
  }

  // 🌏 PUBLIC: Facebook and the PRX web portal need to see this without a token
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  // 🌏 PUBLIC: If you want people to see a user's public profile history
  @Get('user/:userId')
  async getHistory(@Param('userId') userId: string) {
    return this.activitiesService.findAll(userId);
  }
}

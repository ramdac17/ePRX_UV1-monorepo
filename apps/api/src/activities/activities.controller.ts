import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateActivityDto } from '../dto/create-activity.dto'; // Updated path

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * Helper to extract userId from JWT payload
   */
  private getUserId(req: any): string {
    return req.user.id || req.user.sub;
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Req() req: any) {
    return this.activitiesService.getDashboardStats(this.getUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: any) {
    return this.activitiesService.findAll(this.getUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async uploadActivity(
    @Req() req: any,
    @Body() createActivityDto: CreateActivityDto, // Now using the DTO for validation
  ) {
    const userId = this.getUserId(req);
    // Passing the structured DTO to ensure mapImageUrl is handled
    return this.activitiesService.createActivity(userId, createActivityDto);
  }

  // 🌏 PUBLIC: Detailed mission view
  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`[API] Attempting to find activity with ID: ${id}`);

    const activity = await this.activitiesService.findOne(id);

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

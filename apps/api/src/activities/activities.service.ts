import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { ShareCardService } from '../share-card/share-card.service';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger('ActivitiesService');

  constructor(
    private prisma: PrismaService,
    private shareCardService: ShareCardService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashboardStats(userId: string) {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totals = activities.reduce(
      (acc, curr) => ({
        distance: acc.distance + (curr.distance || 0),
        duration: acc.duration + (curr.duration || 0),
      }),
      { distance: 0, duration: 0 },
    );

    return {
      recent: activities.slice(0, 7),
      summary: {
        totalDistance: totals.distance.toFixed(1),
        totalHours: (totals.duration / 3600).toFixed(1),
        activityCount: activities.length,
      },
    };
  }

  // ===============================
  // 🚀 CREATE ACTIVITY (OPTIMIZED)
  // ===============================
  async createActivity(userId: string, data: any) {
    const parsedData = {
      title: data.title || 'NEW_SESSION',
      distance: parseFloat(data.distance) || 0,
      duration: parseInt(data.duration) || 0,
      pace: data.pace?.toString() || '0:00',
      elevation: parseFloat(data.elevation) || 0,
      coordinates:
        typeof data.coordinates === 'string'
          ? JSON.parse(data.coordinates)
          : data.coordinates,
      userId,
    };

    const activity = await this.prisma.activity.create({
      data: parsedData,
    });

    // 🔥 fire-and-forget (safe async)
    void this.generateShareCardAsync(activity);

    return activity;
  }

  // ===============================
  // 🔥 BACKGROUND SHARE GENERATION
  // ===============================
  private async generateShareCardAsync(activity: any) {
    try {
      const imageUrl = await this.shareCardService.generateShareImage({
        activityId: activity.id, // ✅ FIXED
        distance: activity.distance,
        pace: activity.pace,
        duration: activity.duration,
      });

      await this.prisma.activity.update({
        where: { id: activity.id },
        data: {
          shareImageUrl: imageUrl,
        },
      });

      this.logger.log(`SHARE_CARD_GENERATED: ${activity.id} → ${imageUrl}`);
    } catch (error) {
      this.logger.error(`SHARE_CARD_FAILED: ${activity.id}`, error);
    }
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }
}

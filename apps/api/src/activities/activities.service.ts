import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { ShareCardService } from '../share-card/share-card.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Ensure this path is correct

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private prisma: PrismaService,
    private shareCardService: ShareCardService,
    private cloudinaryService: CloudinaryService, // 🚀 ADDED THIS TO FIX THE RED LINE
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
        distance: acc.distance + (Number(curr.distance) || 0),
        duration: acc.duration + (Number(curr.duration) || 0),
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
    let uploadedMapUrl = null;

    // 1. Process Base64 Map Image (if present)
    if (data.mapImageUrl && data.mapImageUrl.startsWith('data:image')) {
      try {
        this.logger.log('Processing Base64 Map Image...');
        // We upload to Cloudinary and get the URL back immediately
        const uploadResult = await this.cloudinaryService.uploadBase64(
          data.mapImageUrl,
        );
        uploadedMapUrl = uploadResult.secure_url;
        this.logger.log(`Map Image URL generated: ${uploadedMapUrl}`);
      } catch (err) {
        this.logger.error('Map Upload Failed, continuing with fallback.', err);
      }
    } else {
      // Use existing URL if it's not Base64
      uploadedMapUrl = data.mapImageUrl || null;
    }

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
      mapImageUrl: uploadedMapUrl,
      shareImageUrl: null, // Initialized as null for the background task to fill
    };

    const activity = await this.prisma.activity.create({
      data: parsedData,
    });

    this.logger.log(`Activity ${activity.id} logged. Triggering Share Card...`);
    this.logger.log('DB_SAVE_PAYLOAD: ' + JSON.stringify(parsedData));

    // 🔥 Background process for Satori (Non-blocking)
    this.generateShareCardAsync(activity).catch((err) => {
      this.logger.error(`BACKGROUND_ERROR: ${activity.id}`, err);
    });

    return activity;
  }

  // ===============================
  // 🔥 BACKGROUND SHARE GENERATION
  // ===============================
  private async generateShareCardAsync(activity: any) {
    try {
      const imageUrl = await this.shareCardService.generateShareImage({
        activityId: activity.id,
        distance: activity.distance,
        pace: activity.pace,
        duration: activity.duration,
      });

      if (!imageUrl) throw new Error('Empty URL from ShareCardService');

      await this.prisma.activity.update({
        where: { id: activity.id },
        data: { shareImageUrl: imageUrl },
      });

      this.logger.log(`✅ SHARE CARD READY: ${activity.id}`);
    } catch (error) {
      this.logger.error(
        `❌ SHARE CARD FAILED for ${activity.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }

    return activity;
  }
}

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { ShareCardService } from '../share-card/share-card.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Activity } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private prisma: PrismaService,
    private shareCardService: ShareCardService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // 🚀 RESTORED: findAll
  async findAll(userId: string) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🚀 RESTORED: getDashboardStats
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

  // 🚀 RESTORED: findOne
  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }

    return activity;
  }

  // ==========================================
  // 🚀 CREATE ACTIVITY (WITH FACEBOOK FIX)
  // ==========================================
  async createActivity(userId: string, data: any) {
    let uploadedMapUrl = null;

    if (data.mapImageUrl && data.mapImageUrl.startsWith('data:image')) {
      try {
        const uploadResult = await this.cloudinaryService.uploadBase64(
          data.mapImageUrl,
        );
        uploadedMapUrl = uploadResult.secure_url;
      } catch (err) {
        this.logger.error('Map Upload Failed', err);
      }
    } else {
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
      shareImageUrl: null,
    };

    const activity = await this.prisma.activity.create({ data: parsedData });

    try {
      const shareImageUrl = await this.shareCardService.generateShareImage({
        distance: activity.distance,
        pace: activity.pace,
        activityId: activity.id,
        duration: activity.duration,
      });

      const updatedActivity = await this.prisma.activity.update({
        where: { id: activity.id },
        data: { shareImageUrl },
      });

      // 🔥 Trigger Facebook Scrape immediately
      this.triggerFacebookScrape(updatedActivity.id);

      return updatedActivity;
    } catch (err) {
      this.logger.error(`SHARE_CARD_CREATION_FAILED: ${activity.id}`, err);
      return activity;
    }
  }

  private async triggerFacebookScrape(activityId: string) {
    const shareUrl = `${process.env.BACKEND_URL}/api/share/activity/${activityId}`;

    const fbAppId = '1592938017610534';
    const fbSecret = '7340d59ea80c7e8d35e42beda231451ecd';

    try {
      // 🚀 THE FIX: Use URLSearchParams to ensure the '|' is handled correctly
      // and use the Graph API version 20.0 (or current) for better stability.
      const endpoint = `https://graph.facebook.com/v20.0/`;

      await axios.post(endpoint, null, {
        params: {
          id: shareUrl,
          scrape: true,
          access_token: `${fbAppId}|${fbSecret}`,
        },
      });

      this.logger.log(`✅ FB_SCRAPE_SUCCESS: ${activityId}`);
    } catch (e: any) {
      // Log the detailed error from FB so we can see if it's still a signature issue
      const fbError = e.response?.data?.error?.message || e.message;
      this.logger.error(`❌ FB_SCRAPE_FAILED: ${fbError}`);
    }
  }
}

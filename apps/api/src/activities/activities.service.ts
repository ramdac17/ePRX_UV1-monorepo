import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { ShareCardService } from '../share-card/share-card.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import axios from 'axios';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private prisma: PrismaService,
    private shareCardService: ShareCardService,
    private cloudinaryService: CloudinaryService,
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
  // 🚀 CREATE ACTIVITY (ALIGNED WITH UV1 MOBILE)
  // ==========================================
  // ==========================================
  // 🚀 CREATE ACTIVITY (FIXED & ALIGNED)
  // ==========================================
  async createActivity(userId: string, data: any) {
    let uploadedMapUrl = null;

    // Log incoming data for debugging the null field issue
    this.logger.log(`Payload Keys: ${Object.keys(data)}`);
    this.logger.log(`Snapshot Present: ${!!data.mapSnapshot}`);

    // 1. Image Processing: Support 'mapSnapshot' (Mobile) and 'mapImageUrl' (Web)
    const rawImage = data.mapSnapshot || data.mapImageUrl;

    if (
      rawImage &&
      (rawImage.startsWith('data:image') || rawImage.length > 100)
    ) {
      try {
        this.logger.log('Attempting Cloudinary Upload...');
        const uploadResult =
          await this.cloudinaryService.uploadBase64(rawImage);
        uploadedMapUrl = uploadResult.secure_url;
        this.logger.log(`Cloudinary Success: ${uploadedMapUrl}`);
      } catch (err) {
        this.logger.error('Map Upload Failed', err);
        // Fallback to existing URL if upload fails but rawImage wasn't base64
        if (!rawImage.startsWith('data:image')) uploadedMapUrl = rawImage;
      }
    } else {
      uploadedMapUrl = data.mapImageUrl || null;
    }

    // 2. Automated Pace Calculation
    const dist = parseFloat(data.distance) || 0;
    const dur = parseInt(data.duration) || 0;
    let finalPace = data.pace;

    if (!finalPace && dist > 0 && dur > 0) {
      const paceMinPerKm = dur / 60 / dist;
      const mins = Math.floor(paceMinPerKm);
      const secs = Math.round((paceMinPerKm - mins) * 60);
      finalPace = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // 3. Data Normalization (Added potential missing fields: type, createdAt)
    const parsedData = {
      title: data.title || 'NEW_SESSION',
      distance: dist,
      duration: dur,
      pace: finalPace?.toString() || '0:00',
      elevation: parseFloat(data.elevation) || 0,
      // Map 'path' (Mobile) or 'coordinates' (Existing) safely
      coordinates: Array.isArray(data.path)
        ? data.path
        : typeof data.coordinates === 'string'
          ? JSON.parse(data.coordinates)
          : data.coordinates,
      userId,
      mapImageUrl: uploadedMapUrl, // This was likely missing or overwritten before
      shareImageUrl: null,
    };

    try {
      const activity = await this.prisma.activity.create({ data: parsedData });
      this.logger.log(
        `✅ Activity Created: ${activity.id} | Map: ${!!activity.mapImageUrl}`,
      );

      // 4. Generate Share Card & FB Scrape
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

      this.triggerFacebookScrape(updatedActivity.id);
      return updatedActivity;
    } catch (err) {
      this.logger.error(`CREATE_OR_SHARE_FAILED`, err);
      // Return whatever we have so the user doesn't lose data
      return { id: 'error', ...parsedData };
    }
  }

  private async triggerFacebookScrape(activityId: string) {
    const shareUrl = `${process.env.BACKEND_URL}/api/share/activity/${activityId}`;
    const fbAppId = '1592938017610534';
    const fbSecret = process.env.FB_APP_SECRET;

    if (!fbSecret) {
      this.logger.error('FB_APP_SECRET missing in ENV');
      return;
    }

    try {
      const params = new URLSearchParams({
        id: shareUrl,
        scrape: 'true',
        access_token: `${fbAppId}|${fbSecret}`,
      });

      await axios.post(
        `https://graph.facebook.com/v20.0/?${params.toString()}`,
      );
      this.logger.log(`✅ FB_SCRAPE_SUCCESS: ${activityId}`);
    } catch (e: any) {
      this.logger.error(
        'FB_SCRAPE_FAILED',
        e.response?.data?.error?.message || e.message,
      );
    }
  }
}

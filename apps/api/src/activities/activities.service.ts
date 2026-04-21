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

  async createActivity(userId: string, data: any) {
    let uploadedMapUrl = null;

    // 1. Process Map Image
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

    // 2. Create the initial record
    const activity = await this.prisma.activity.create({ data: parsedData });

    try {
      // 3. 🚀 GENERATE IMAGE (Await this so it's ready for the crawler)
      const shareImageUrl = await this.shareCardService.generateShareImage({
        distance: activity.distance,
        pace: activity.pace,
        activityId: activity.id,
        duration: activity.duration,
      });

      // 4. Update the DB with the Cloudinary link
      const updatedActivity = await this.prisma.activity.update({
        where: { id: activity.id },
        data: { shareImageUrl },
      });

      // 5. 🔥 THE POKE: Force Facebook to scrape the URL immediately
      this.triggerFacebookScrape(updatedActivity.id);

      return updatedActivity;
    } catch (err) {
      this.logger.error(`SHARE_CARD_CREATION_FAILED: ${activity.id}`, err);
      return activity;
    }
  }

  private async triggerFacebookScrape(activityId: string) {
    const url = `${process.env.BACKEND_URL}/api/share/activity/${activityId}`;
    try {
      const fbAppId = '1592938017610534';
      const fbSecret = '7340d59ea80c7e8d35e42beda231451ecd';

      // This is a fire-and-forget call to the Facebook Graph API
      axios
        .post(`https://graph.facebook.com`, {
          id: url,
          scrape: true,
          access_token: `${fbAppId}|${fbSecret}`,
        })
        .catch((e) =>
          this.logger.error(
            'FB_ASYNC_SCRAPE_ERR',
            e.response?.data || e.message,
          ),
        );

      this.logger.log(`Facebook scrape triggered for ${activityId}`);
    } catch (e: any) {
      this.logger.error('FB_SCRAPE_FAILED', e.message);
    }
  }
}

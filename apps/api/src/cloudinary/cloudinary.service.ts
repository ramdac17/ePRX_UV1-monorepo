import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  onModuleInit() {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    // Simple check to prevent silent hangs
    if (!config.cloud_name || !config.api_key) {
      this.logger.error(
        '❌ Cloudinary config is missing! Check environment variables.',
      );
    } else {
      cloudinary.config(config);
      this.logger.log('✅ Cloudinary configured successfully.');
    }
  }

  // ===============================
  // 🔥 SHARE CARD UPLOADER
  // ===============================
  async uploadShareCard(buffer: Buffer, activityId: string): Promise<string> {
    this.logger.log(`Starting Cloudinary upload for activity: ${activityId}`);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'eprx_share_cards',
          public_id: `activity-${activityId}`,
          overwrite: true,
          resource_type: 'image', // Explicitly set this
        },
        (error, result) => {
          if (error) {
            this.logger.error('❌ Cloudinary Upload Error:', error);
            return reject(error);
          }
          this.logger.log(`✅ Upload complete: ${result?.secure_url}`);
          resolve(result?.secure_url || '');
        },
      );

      // If the buffer is empty, this will hang. Let's add a guard.
      if (!buffer || buffer.length === 0) {
        return reject(
          new Error('Buffer is empty! Cannot upload to Cloudinary.'),
        );
      }

      stream.end(buffer);
    });
  }

  // ===============================
  // 🔥 GENERIC UPLOAD (OPTIONAL FLEX)
  // ===============================
  async uploadImage(buffer: Buffer, folder = 'eprx_misc'): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        },
      );

      stream.end(buffer);
    });
  }
}

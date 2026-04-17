import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  // Initialize Cloudinary Configuration
  onModuleInit() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.logger.log('Cloudinary SDK Initialized');
  }

  // ===============================
  // 🚀 BASE64 UPLOADER (FOR MAPS)
  // ===============================
  async uploadBase64(
    base64String: string,
    folder: string = 'eprx_maps',
  ): Promise<any> {
    try {
      this.logger.log(`Uploading Base64 image to folder: ${folder}`);
      // Cloudinary handles the "data:image/jpeg;base64,..." format automatically
      const result = await cloudinary.uploader.upload(base64String, {
        folder: folder,
        resource_type: 'image',
      });
      return result;
    } catch (error) {
      this.logger.error('❌ Base64 Upload Failed:', error);
      throw new Error(
        `Cloudinary Upload Failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ===============================
  // 🔥 SHARE CARD UPLOADER (BUFFER)
  // ===============================
  async uploadShareCard(buffer: Buffer, activityId: string): Promise<string> {
    this.logger.log(`Starting Cloudinary upload for activity: ${activityId}`);

    if (!buffer || buffer.length === 0) {
      throw new Error('Buffer is empty! Cannot upload to Cloudinary.');
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'eprx_share_cards',
          public_id: `activity-${activityId}`,
          overwrite: true,
          resource_type: 'image',
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

      stream.end(buffer);
    });
  }

  // ===============================
  // 📦 GENERIC UPLOADER
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

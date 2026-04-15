import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // ===============================
  // 🧠 MULTER STORAGE (AVATARS)
  // ===============================
  get storage() {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'eprx_avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      } as any,
    });
  }

  // ===============================
  // 🔥 SHARE CARD UPLOADER (NEW)
  // ===============================
  async uploadShareCard(buffer: Buffer, activityId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'eprx_share_cards',
          public_id: `activity-${activityId}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        },
      );

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

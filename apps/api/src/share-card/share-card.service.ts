import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class ShareCardService {
  private readonly logger = new Logger(ShareCardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // =====================================================
  // OG PAGE (Deterministic Meta Tags)
  // =====================================================
  async generateOGPage(id: string): Promise<string> {
    try {
      // 1. Fetch the activity
      let activity = await this.prisma.activity.findUnique({ where: { id } });

      // 2. RETRY LOGIC: If image is null, wait 2 seconds and check again
      // This gives the background Satori process time to finish
      if (!activity?.shareImageUrl) {
        this.logger.log(`Image not ready for ${id}, waiting 2s...`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
        activity = await this.prisma.activity.findUnique({ where: { id } });
      }

      const distance = this.formatDistance(activity?.distance);
      const duration = activity?.duration ?? 0;
      const pace = activity?.pace ?? '0:00';

      // 3. Resolve Image with Cache Buster
      const image = this.resolveOgImage(
        activity,
        `${process.env.BACKEND_URL}/default-share.png`,
      );

      // Add a timestamp to the image URL to force FB to ignore its old cache
      const finalImage = image.includes('cloudinary')
        ? `${image}?t=${Date.now()}`
        : image;

      return this.renderOGHtml({
        title: `ePRX Mission - ${distance} KM`,
        description: `Time: ${duration}s • Pace: ${pace}`,
        image: finalImage,
        url: `${process.env.BACKEND_URL}/share/activity/${id}`,
        distance,
      });
    } catch (err) {
      return this.renderFallbackOG();
    }
  }

  // =====================================================
  // SHARE IMAGE GENERATOR (Puppeteer-Free)
  // =====================================================
  async generateShareImage(data: {
    distance: number;
    pace: string;
    activityId: string;
    duration?: number;
  }): Promise<string> {
    try {
      // 1. Robust Font Resolution (Scanning multiple likely locations)
      const possibleFontPaths = [
        // 1. Current working directory + public (Standard)
        join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf'),

        // 2. Monorepo root style (if process.cwd is /app)
        join(process.cwd(), 'apps', 'api', 'public', 'fonts', 'Inter-Bold.ttf'),

        // 3. Absolute path for Railway/Docker
        '/app/apps/api/public/fonts/Inter-Bold.ttf',

        // 4. Relative to the compiled file (the "nuclear" option)
        join(__dirname, '..', '..', 'public', 'fonts', 'Inter-Bold.ttf'),
      ];

      let fontPath = '';
      for (const p of possibleFontPaths) {
        if (fs.existsSync(p)) {
          fontPath = p;
          break;
        }
      }

      if (!fontPath) {
        this.logger.error(
          `CRITICAL: Font not found. Checked: ${possibleFontPaths.join(', ')}`,
        );
        throw new Error('Inter-Bold.ttf missing from build artifacts');
      }

      const fontData = fs.readFileSync(fontPath);

      // 2. SVG Generation via Satori
      const svg = await satori(
        {
          type: 'div',
          props: {
            style: {
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at top, #00ffff, #000000)',
              color: '#00fff2',
              textAlign: 'center',
              fontFamily: 'Inter',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: 50,
                    marginBottom: 20,
                    letterSpacing: '4px',
                  },
                  children: 'ePRX MISSION',
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 110, fontWeight: 900, marginBottom: 10 },
                  children: `${Number(data.distance || 0).toFixed(2)} KM`,
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 35, opacity: 0.8 },
                  children: `Pace: ${data.pace ?? '0:00'}`,
                },
              },
            ],
          },
        } as any,
        {
          width: 1080,
          height: 1080,
          fonts: [
            {
              name: 'Inter',
              data: fontData,
              weight: 700,
              style: 'normal',
            },
          ],
        },
      );

      // 3. PNG Conversion via Resvg
      const resvg = new Resvg(svg, {
        background: 'rgba(0,0,0,1)',
        fitTo: { mode: 'width', value: 1080 },
      });
      const pngBuffer = resvg.render().asPng();

      // 4. Cloudinary Upload
      this.logger.log(
        `Uploading mission card for ${data.activityId} to Cloudinary...`,
      );
      const imageUrl = await this.cloudinary.uploadShareCard(
        pngBuffer,
        data.activityId,
      );

      if (!imageUrl) throw new Error('Cloudinary upload returned no URL');

      this.logger.log(`✅ Satori image generated & uploaded: ${imageUrl}`);

      // Return the URL to ActivitiesService for DB persistence
      return imageUrl;
    } catch (err) {
      this.logger.error(
        `SATORI_GENERATION_FAILED for ${data.activityId}`,
        err instanceof Error ? err.message : String(err),
      );
      throw err;
    }
  }

  // =====================================================
  // HTML RENDERERS & HELPERS
  // =====================================================

  private renderOGHtml({ title, description, image, url, distance }: any) {
    const safeTitle = this.escapeHtml(title);
    const safeDesc = this.escapeHtml(description);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <meta property="og:type" content="website" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDesc}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1080" />
<meta property="og:image:height" content="1080" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${image}" />
  <style>
    body { background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
    .card { border: 2px solid #00fff2; padding: 40px; border-radius: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h1>ePRX MISSION LOG</h1>
    <p style="font-size: 2rem;">${distance} KM COMPLETED</p>
  </div>
</body>
</html>`;
  }

  private renderFallbackOG(): string {
    const fallback = `${process.env.BACKEND_URL}/default-share.png`;
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta property="og:image" content="${fallback}" /><title>ePRX Mission Log</title></head><body><h1>ePRX Mission Log</h1></body></html>`;
  }

  private resolveOgImage(activity: any, fallback: string): string {
    this.logger.log(`Resolving OG Image for Activity: ${activity?.id}`);

    // 1. Check the Satori generated share card (Highest Priority)
    if (activity?.shareImageUrl && activity.shareImageUrl.startsWith('http')) {
      this.logger.log(`Using Share Image: ${activity.shareImageUrl}`);
      return activity.shareImageUrl;
    }

    // 2. Check for the Map Image (Second Priority)
    if (activity?.mapImageUrl && activity.mapImageUrl.startsWith('http')) {
      this.logger.log(`Using Map Image: ${activity.mapImageUrl}`);
      return activity.mapImageUrl;
    }

    // 3. Fallback (Last Resort)
    this.logger.warn(`No images found for ${activity?.id}, using fallback.`);
    return fallback;
  }

  private formatDistance(distance?: number | any): string {
    return distance ? Number(distance).toFixed(2) : '0.00';
  }

  private escapeHtml(str: string = ''): string {
    return str.replace(
      /[&<>"']/g,
      (m) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[m]!,
    );
  }
}

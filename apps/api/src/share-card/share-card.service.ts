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
  // OG PAGE (Facebook-safe, deterministic)
  // =====================================================
  async generateOGPage(id: string): Promise<string> {
    try {
      const activity = await this.prisma.activity.findUnique({
        where: { id },
      });

      const fallbackImage = `${process.env.BACKEND_URL}/default-share.png`;

      const distance = this.formatDistance(activity?.distance);
      const duration = activity?.duration ?? 0;
      const pace = activity?.pace ?? '0:00';

      const title = `ePRX Mission Log - ${distance} KM`;
      const description = `Time: ${duration}s • Pace: ${pace}`;

      const image = this.resolveOgImage(activity, fallbackImage);

      // IMPORTANT: cache bust OG PAGE, NOT image
      const url = `${process.env.BACKEND_URL}/share/activity/${id}?v=${Date.now()}`;

      return this.renderOGHtml({
        title,
        description,
        image,
        url,
        distance,
      });
    } catch (err) {
      this.logger.error(`OG_PAGE_FAILED: ${id}`, err);
      return this.renderFallbackOG();
    }
  }

  // =====================================================
  // SHARE IMAGE GENERATOR (Satori + Resvg Powered)
  // =====================================================
  async generateShareImage(data: {
    distance: number;
    pace: string;
    activityId: string;
    duration?: number;
  }): Promise<string> {
    try {
      // 1. Load Font Buffer (Satori requirement)
      // Path: apps/backend/public/fonts/Inter-Bold.ttf
      const fontPath = join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf');
      const fontData = fs.readFileSync(fontPath);

      // 2. Build Image with Satori (SVG)
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

      // 3. Convert SVG to PNG
      const resvg = new Resvg(svg, {
        background: 'rgba(0,0,0,1)',
        fitTo: { mode: 'width', value: 1080 },
      });
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      // 4. Upload to Cloudinary
      const imageUrl = await this.cloudinary.uploadShareCard(
        pngBuffer,
        data.activityId,
      );

      // 5. Save URL to Database
      await this.prisma.activity.update({
        where: { id: data.activityId },
        data: { shareImageUrl: imageUrl },
      });

      this.logger.log(`Share image updated in DB: ${imageUrl}`);
      return imageUrl;
    } catch (err) {
      this.logger.error('SATORI_GENERATION_FAILED', err);
      throw err;
    }
  }

  // =====================================================
  // OG HTML (Facebook-optimized)
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

  <meta property="og:type" content="article" /> 
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta property="og:site_name" content="ePRX UV1" />

  <style>
    body { background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
  </style>
</head>
<body>
  <div>
    <h1>ePRX MISSION LOG</h1>
    <p>${distance} KM COMPLETED</p>
  </div>
</body>
</html>
  `;
  }

  // =====================================================
  // FALLBACK OG
  // =====================================================
  private renderFallbackOG(): string {
    const fallback = `${process.env.BACKEND_URL}/default-share.png`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="og:title" content="ePRX Mission Log" />
  <meta property="og:description" content="Run tracking achievement" />
  <meta property="og:image" content="${fallback}" />
  <meta property="og:type" content="website" />
  <title>ePRX Mission Log</title>
</head>
<body><h1>ePRX Mission Log</h1></body>
</html>
    `;
  }

  // =====================================================
  // HELPERS
  // =====================================================
  private resolveOgImage(activity: any, fallback: string): string {
    const image = activity?.shareImageUrl || activity?.mapImageUrl || fallback;
    if (!image || typeof image !== 'string') return fallback;
    return image.startsWith('http') ? image : fallback;
  }

  private formatDistance(distance?: number): string {
    return distance ? Number(distance).toFixed(2) : '0.00';
  }

  private escapeHtml(str: string = ''): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

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
  // OG PAGE (Deterministic Meta Tags for FB/Twitter)
  // =====================================================
  async generateOGPage(id: string): Promise<string> {
    try {
      let activity = await this.prisma.activity.findUnique({ where: { id } });

      // Retry logic: If image data hasn't persisted yet, wait briefly
      if (!activity?.mapImageUrl && !activity?.shareImageUrl) {
        this.logger.log(
          `Mission data not fully synced for ${id}, waiting 2.5s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2500));
        activity = await this.prisma.activity.findUnique({ where: { id } });
      }

      const distance = this.formatDistance(activity?.distance);
      const duration = activity?.duration ?? 0;
      const pace = activity?.pace ?? '0:00';

      // 🚀 THE GOAL: Prioritize Map Image for the social preview
      const image = this.resolveOgImage(
        activity,
        `${process.env.BACKEND_URL}/api/default-share.png`, // Ensure /api/ prefix if applicable
      );

      // Cache Buster: Force FB to ignore stale "Cannot GET" or old image results
      const finalImage = image.includes('http')
        ? `${image}?t=${Date.now()}`
        : image;

      return this.renderOGHtml({
        title: `ePRX MISSION: ${distance} KM`,
        description: `Mission Time: ${duration}s • Pace: ${pace}`,
        image: finalImage,
        url: `${process.env.BACKEND_URL}/api/share/activity/${id}`,
        distance,
      });
    } catch (err) {
      this.logger.error(`OG_GENERATE_FAILED for ${id}:`, err);
      return this.renderFallbackOG();
    }
  }

  // =====================================================
  // SHARE IMAGE GENERATOR (Satori + Resvg)
  // =====================================================
  async generateShareImage(data: {
    distance: number;
    pace: string;
    activityId: string;
    duration?: number;
  }): Promise<string> {
    try {
      const fontPath = this.resolveFontPath();
      const fontData = fs.readFileSync(fontPath);

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
            { name: 'Inter', data: fontData, weight: 700, style: 'normal' },
          ],
        },
      );

      const resvg = new Resvg(svg, {
        background: 'rgba(0,0,0,1)',
        fitTo: { mode: 'width', value: 1080 },
      });

      const pngBuffer = resvg.render().asPng();
      const imageUrl = await this.cloudinary.uploadShareCard(
        pngBuffer,
        data.activityId,
      );

      if (!imageUrl) throw new Error('Cloudinary upload failed');
      return imageUrl;
    } catch (err) {
      this.logger.error(`SATORI_ERROR for ${data.activityId}:`, err);
      throw err;
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private resolveOgImage(activity: any, fallback: string): string {
    this.logger.log(`Resolving OG Image for Activity: ${activity?.id}`);

    // 🚀 PRIORITY 1: Map Image (The Goal)
    if (activity?.mapImageUrl?.startsWith('http')) {
      this.logger.log(`Using Map Image URL: ${activity.mapImageUrl}`);
      return activity.mapImageUrl;
    }

    // PRIORITY 2: Satori Share Card (Secondary fallback)
    if (activity?.shareImageUrl?.startsWith('http')) {
      this.logger.log(`Using Share Image URL: ${activity.shareImageUrl}`);
      return activity.shareImageUrl;
    }

    this.logger.warn(
      `No specific images found for ${activity?.id}, using fallback.`,
    );
    return fallback;
  }

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
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="315" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${image}" />
  <style>
    body { background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
    .card { border: 2px solid #00fff2; padding: 40px; border-radius: 20px; text-align: center; max-width: 80%; }
    h1 { letter-spacing: 2px; color: #00fff2; }
  </style>
</head>
<body>
  <div class="card">
    <h1>ePRX MISSION LOG</h1>
    <p style="font-size: 2rem;">${distance} KM COMPLETED</p>
    <p style="opacity: 0.6;">Redirecting to the grid...</p>
  </div>
  <script>
    setTimeout(() => { window.location.href = "https://eprxuv1-monorepo-production.up.railway.app"; }, 3000);
  </script>
</body>
</html>`;
  }

  private renderFallbackOG(): string {
    const fallback = `${process.env.BACKEND_URL}/api/default-share.png`;
    return `<!DOCTYPE html><html><head><meta property="og:image" content="${fallback}" /><title>ePRX Mission</title></head><body><h1>Redirecting...</h1></body></html>`;
  }

  private resolveFontPath(): string {
    const paths = [
      join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf'),
      join(process.cwd(), 'apps', 'api', 'public', 'fonts', 'Inter-Bold.ttf'),
      '/app/apps/api/public/fonts/Inter-Bold.ttf',
    ];
    for (const p of paths) if (fs.existsSync(p)) return p;
    throw new Error('Inter-Bold.ttf not found in any known path');
  }

  private formatDistance(distance?: any): string {
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

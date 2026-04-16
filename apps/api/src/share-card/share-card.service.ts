import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

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
  // SHARE IMAGE GENERATOR (Cloudinary-backed)
  // =====================================================
  async generateShareImage(data: {
    distance: number;
    pace: string;
    duration?: number;
    activityId: string;
  }): Promise<string> {
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = (await import('puppeteer-core')).default;

    let browser;

    try {
      browser = await puppeteer.launch({
        args: [
          ...chromium.default.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
        executablePath: (await chromium.default.executablePath()) || undefined,
        headless: true,
        defaultViewport: {
          width: 1080,
          height: 1080,
        },
      });

      const page = await browser.newPage();

      await page.setContent(this.buildShareImageHtml(data), {
        waitUntil: 'networkidle0',
      });

      const screenshot = await page.screenshot({ type: 'png' });

      const buffer = Buffer.isBuffer(screenshot)
        ? screenshot
        : Buffer.from(screenshot);

      const imageUrl = await this.cloudinary.uploadShareCard(
        buffer,
        data.activityId,
      );

      await this.prisma.activity.update({
        where: { id: data.activityId },
        data: {
          shareImageUrl: imageUrl,
        },
      });

      this.logger.log(`Share image generated: ${imageUrl}`);

      return imageUrl;
    } catch (err) {
      this.logger.error('SHARE_IMAGE_GENERATION_FAILED', err);
      throw err;
    } finally {
      if (browser) await browser.close();
    }
  }

  // =====================================================
  // IMAGE HTML
  // =====================================================
  private buildShareImageHtml(data: { distance: number; pace: string }) {
    return `
      <html>
        <body style="
          margin:0;
          background: radial-gradient(circle at top, #0ff, #000);
          color:#00fff2;
          font-family: Arial, sans-serif;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          height:100vh;
          text-align:center;
        ">
          <h1 style="font-size:48px;">ePRX MISSION</h1>
          <h2 style="font-size:64px;margin:0;">
            ${Number(data.distance || 0).toFixed(2)} KM
          </h2>
          <p style="font-size:24px;">
            Pace: ${data.pace ?? '0:00'}
          </p>
        </body>
      </html>
    `;
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

  <meta property="og:type" content="article" /> <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta property="og:site_name" content="ePRX UV1" />
  <meta property="fb:app_id" content="YOUR_FB_APP_ID_IF_YOU_HAVE_ONE" />

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
  // FALLBACK OG (ALWAYS SAFE FOR FACEBOOK)
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
<body>
  <h1>ePRX Mission Log</h1>
</body>
</html>
    `;
  }

  // =====================================================
  // HELPERS
  // =====================================================
  private resolveOgImage(activity: any, fallback: string): string {
    const image = activity?.shareImageUrl || activity?.mapImageUrl || fallback;

    if (!image || typeof image !== 'string') {
      return fallback;
    }

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

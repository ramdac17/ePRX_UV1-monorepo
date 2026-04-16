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
  // OG PAGE (Facebook-safe, deterministic, no crashes)
  // =====================================================
  async generateOGPage(id: string): Promise<string> {
    try {
      const activity = await this.prisma.activity.findUnique({
        where: { id },
      });

      const fallbackImage = `${process.env.BACKEND_URL}/default-share.png`;

      const safeDistance = this.formatDistance(activity?.distance);
      const safeDuration = activity?.duration ?? 0;
      const safePace = activity?.pace ?? '0:00';

      const title = `ePRX Mission Log - ${safeDistance} KM`;
      const description = `Time: ${safeDuration}s • Pace: ${safePace}`;

      const image = this.resolveOgImage(activity, fallbackImage);

      const url = `${process.env.BACKEND_URL}/share/activity/${id}`;

      return this.renderOGHtml({
        title,
        description,
        image,
        url,
        distance: safeDistance,
      });
    } catch (err) {
      this.logger.error(`OG_PAGE_FAILED: ${id}`, err);

      // NEVER fail Facebook scraping
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

      const html = this.buildShareImageHtml(data);

      await page.setContent(html, { waitUntil: 'networkidle0' });

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
  // IMAGE HTML (isolated builder)
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
            ${Number(data.distance).toFixed(2)} KM
          </h2>
          <p style="font-size:24px;">
            Pace: ${data.pace}
          </p>
        </body>
      </html>
    `;
  }

  // =====================================================
  // OG HTML (Facebook-safe output)
  // =====================================================
  private renderOGHtml({
    title,
    description,
    image,
    url,
    distance,
  }: {
    title: string;
    description: string;
    image: string;
    url: string;
    distance: string;
  }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${this.escapeHtml(title)}" />
  <meta property="og:description" content="${this.escapeHtml(description)}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${this.escapeHtml(title)}" />
  <meta name="twitter:description" content="${this.escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />

  <title>${this.escapeHtml(title)}</title>

  <meta http-equiv="Cache-Control" content="public, max-age=600" />

  <style>
    body {
      margin: 0;
      background: #000;
      color: #fff;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
  </style>
</head>

<body>
  <div>
    <h1>ePRX Mission Log</h1>
    <p>${distance} KM Completed</p>
  </div>
</body>
</html>
    `;
  }

  // =====================================================
  // SAFE FALLBACK (CRITICAL FOR FACEBOOK)
  // =====================================================
  private renderFallbackOG(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />

  <meta property="og:title" content="ePRX Mission Log" />
  <meta property="og:description" content="Run tracking achievement" />
  <meta property="og:image" content="${process.env.BACKEND_URL}/default-share.png" />
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
    return activity?.shareImageUrl || activity?.mapImageUrl || fallback;
  }

  private formatDistance(distance?: number): string {
    return distance ? Number(distance).toFixed(2) : '0.00';
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private renderNotFound() {
    return `
      <html>
        <head><title>Not found</title></head>
        <body style="background:#000;color:#fff;text-align:center;margin-top:50px;">
          <h1>Activity not found</h1>
        </body>
      </html>
    `;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class ShareCardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ===============================
  // PUBLIC: OG PAGE GENERATOR
  // ===============================
  async generateOGPage(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) return this.renderNotFound();

    const distance = Number(activity.distance || 0).toFixed(2);
    const duration = activity.duration || 0;
    const pace = activity.pace || '0:00';

    const title = `ePRX Mission Log - ${distance} KM`;
    const description = `Time: ${duration}s • Pace: ${pace}`;

    const image =
      activity.shareImageUrl ||
      activity.mapImageUrl ||
      `${process.env.BACKEND_URL}/default-share.png`;

    const url = `${process.env.BACKEND_URL}/share/activity/${id}`;

    return this.renderOGHtml({
      title,
      description,
      image,
      url,
      distance,
    });
  }

  // ===============================
  // SHARE IMAGE GENERATOR
  // ===============================
  async generateShareImage(data: {
    distance: number;
    pace: string;
    duration?: number;
    activityId: string;
  }): Promise<string> {
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = (await import('puppeteer-core')).default;

    const browser = await puppeteer.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true,
      defaultViewport: {
        width: 1080,
        height: 1080,
      },
    });

    const page = await browser.newPage();

    try {
      const html = `
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

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // ✅ screenshot BEFORE closing browser
      const screenshot = await page.screenshot({ type: 'png' });

      const buffer: Buffer = Buffer.isBuffer(screenshot)
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

      return imageUrl;
    } finally {
      await browser.close();
    }
  }

  // ===============================
  // HTML BUILDERS
  // ===============================
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

  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <title>${title}</title>

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

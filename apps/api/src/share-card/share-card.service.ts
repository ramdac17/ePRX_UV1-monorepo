import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShareCardService {
  constructor(private readonly prisma: PrismaService) {}

  // ===============================
  // PUBLIC: OG PAGE GENERATOR
  // ===============================
  async generateOGPage(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return this.renderNotFound();
    }

    const distance = Number(activity.distance || 0).toFixed(2);
    const duration = activity.duration || 0;
    const pace = activity.pace || '0:00';

    const title = `ePRX Mission Log - ${distance} KM`;
    const description = `Time: ${duration}s • Pace: ${pace}`;

    // 🔥 IMPORTANT: always provide a fallback image
    const image =
      activity.shareImageUrl ||
      activity.mapImageUrl ||
      `${process.env.BACKEND_URL}/default-share.png`;

    const url = `${process.env.BACKEND_URL}/share/activity/${id}`;

    return this.renderOGHtml({ title, description, image, url, distance });
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

  <!-- Open Graph -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />

  <!-- Twitter -->
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

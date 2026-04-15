import { Controller } from '@nestjs/common';
import { Get, Param, Res } from '@nestjs/common';
import { ShareCardService } from './share-card.service';
import puppeteer from 'puppeteer-core';

@Controller('share')
export class ShareCardController {
  constructor(private readonly shareCardService: ShareCardService) {}

  @Get('activity/:id')
  async getActivitySharePage(@Param('id') id: string) {
    return this.shareCardService.generateOGPage(id);
  }

  async generateShareImage(data: any): Promise<string> {
    const chromium = await import('@sparticuz/chromium');

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

    const html = `
    <html>
      <body style="
        margin:0;
        background:#000;
        color:#00fff2;
        font-family:sans-serif;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        height:100vh;
      ">
        <h1>ePRX Mission</h1>
        <h2>${data.distance} KM</h2>
        <p>Pace: ${data.pace}</p>
      </body>
    </html>
  `;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.screenshot({ type: 'png' });

    await browser.close();

    // 👉 TEMP: return base64 (we’ll upload next)
    return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
  }
}

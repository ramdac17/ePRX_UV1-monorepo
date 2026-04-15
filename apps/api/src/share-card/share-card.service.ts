import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { join } from 'path';
import { Injectable } from '@nestjs/common';

export class ShareCardService {
  async generateCard(data: any) {
    // ✅ dynamic import inside function (safe for NestJS + CommonJS)
    const chromium = await import('@sparticuz/chromium');

    const htmlPath = join(process.cwd(), 'share-card.html');

    const html = fs
      .readFileSync(htmlPath, 'utf-8')
      .replace('{{mapUrl}}', data.mapUrl)
      .replace('{{distance}}', data.distance)
      .replace('{{time}}', data.time)
      .replace('{{pace}}', data.pace);

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

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.screenshot({
      type: 'png',
    });

    await browser.close();

    return buffer;
  }
}

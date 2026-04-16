import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShareCardService } from './share-card.service';

@Controller('share')
export class ShareCardController {
  constructor(private readonly shareCardService: ShareCardService) {}

  @Get('activity/:id')
  async getOGPage(@Param('id') id: string, @Res() res: Response) {
    const html = await this.shareCardService.generateOGPage(id);

    res.status(200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600'); // 10 min cache

    return res.send(html);
  }
}

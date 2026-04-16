import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShareCardService } from './share-card.service';

@Controller('share')
export class ShareCardController {
  constructor(private readonly shareCardService: ShareCardService) {}

  @Get('activity/:id')
  async getActivitySharePage(@Param('id') id: string, @Res() res: Response) {
    const html = await this.shareCardService.generateOGPage(id);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}

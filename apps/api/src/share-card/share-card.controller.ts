import { Controller } from '@nestjs/common';
import { Get, Param, Res } from '@nestjs/common';
import { ShareCardService } from './share-card.service';
import type { Response } from 'express';

@Controller('share-card')
export class ShareCardController {
  constructor(private readonly service: ShareCardService) {}

  @Get(':id')
  async getCard(@Param('id') id: string, @Res() res: Response) {
    // 🔥 Replace with real DB fetch
    const activity = {
      distance: '5.21',
      time: '32M',
      pace: '6:10',
      mapUrl: 'https://maps.googleapis.com/...',
    };

    const image = await this.service.generateCard(activity);

    res.setHeader('Content-Type', 'image/png');
    res.send(image);
  }
}

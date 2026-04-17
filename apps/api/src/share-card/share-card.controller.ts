import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShareCardService } from './share-card.service';

@Controller('share')
export class ShareCardController {
  constructor(private readonly shareCardService: ShareCardService) {}

  @Get('activity/:id')
  async getSharePage(@Param('id') id: string) {
    // IMPORTANT: The service needs the ID to fetch the LATEST data from DB
    return this.shareCardService.generateOGPage(id);
  }
}

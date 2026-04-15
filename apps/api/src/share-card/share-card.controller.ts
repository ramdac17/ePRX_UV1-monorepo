import { Controller } from '@nestjs/common';
import { Get, Param, Res } from '@nestjs/common';
import { ShareCardService } from './share-card.service';

@Controller('share')
export class ShareCardController {
  constructor(private readonly shareCardService: ShareCardService) {}

  @Get('activity/:id')
  async getActivitySharePage(@Param('id') id: string) {
    return this.shareCardService.generateOGPage(id);
  }
}

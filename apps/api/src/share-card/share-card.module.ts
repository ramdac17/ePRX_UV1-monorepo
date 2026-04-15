import { Module } from '@nestjs/common';
import { ShareCardService } from './share-card.service';
import { ShareCardController } from './share-card.controller';

@Module({
  controllers: [ShareCardController],
  providers: [ShareCardService],
})
export class ShareCardModule {}

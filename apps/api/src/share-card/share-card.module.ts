import { Module } from '@nestjs/common';
import { ShareCardController } from './share-card.controller';
import { ShareCardService } from './share-card.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShareCardController],
  providers: [ShareCardService],
})
export class ShareCardModule {}

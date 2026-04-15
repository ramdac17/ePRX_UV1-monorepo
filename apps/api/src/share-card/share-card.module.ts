import { Module } from '@nestjs/common';
import { ShareCardController } from './share-card.controller';
import { ShareCardService } from './share-card.service';
import { PrismaModule } from '../prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ShareCardController],
  providers: [ShareCardService],
})
export class ShareCardModule {}

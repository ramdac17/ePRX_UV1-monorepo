import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { PrismaModule } from '../prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ShareCardModule } from '../share-card/share-card.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [PrismaModule, CloudinaryModule, ShareCardModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, PrismaService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}

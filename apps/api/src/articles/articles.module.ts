import { Module, forwardRef } from '@nestjs/common';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';
import { PrismaService } from '../prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module.js';
import { ShareCardModule } from '@/share-card/share-card.module.js';

@Module({
  imports: [forwardRef(() => AuthModule), CloudinaryModule, ShareCardModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, PrismaService],
  exports: [ArticlesService],
})
export class ArticlesModule {}

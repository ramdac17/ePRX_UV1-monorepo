import { Module, forwardRef } from '@nestjs/common';
import { ArticlesController } from './articles.controller'; // Removed .js
import { ArticlesService } from './articles.service'; // Removed .js
import { PrismaService } from '../prisma.service'; // Removed .js
import { AuthModule } from '../auth/auth.module'; // Removed .js
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Removed .js
import { ShareCardModule } from '../share-card/share-card.module'; // Removed .js

@Module({
  imports: [forwardRef(() => AuthModule), CloudinaryModule, ShareCardModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, PrismaService],
  exports: [ArticlesService],
})
export class ArticlesModule {}

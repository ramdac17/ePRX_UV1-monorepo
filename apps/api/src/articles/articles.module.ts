import { Module, forwardRef } from '@nestjs/common';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';
import { PrismaService } from '../prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ArticlesController],
  providers: [ArticlesService, PrismaService],
  exports: [ArticlesService],
})
export class ArticlesModule {}

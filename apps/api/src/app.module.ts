import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ArticlesModule } from './articles/articles.module.js';
import { UserModule } from './user/user.module.js';
import { MailModule } from './mail/mail.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(process.cwd(), 'apps/api/.env'),
      ],
    }),

    /**
     * 🛰️ ePRX UV1 Note:
     * We are now using Cloudinary for User Avatars.
     * ServeStaticModule is kept here only for legacy support or non-cloud assets.
     */
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      // Wildcard fix for path-to-regexp v8 (NestJS 11)
      exclude: ['/api/(.*)'],
    }),

    // Order matters slightly for initialization; keep core modules first
    PrismaModule,
    MailModule,
    UserModule,
    AuthModule,
    EventsModule,
    ArticlesModule,
    ActivitiesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

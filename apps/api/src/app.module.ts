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

    // ServeStaticModule configured for ePRX UV1 Production
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      /**
       * 🚨 FIX APPLIED:
       * Changed '/api/:splat*' -> '/api/(.*)'
       * path-to-regexp v8+ (NestJS 11) requires this syntax for wildcards.
       */
      exclude: ['/api/(.*)'],
    }),

    EventsModule,
    MailModule,
    AuthModule,
    PrismaModule,
    ArticlesModule,
    UserModule,
    ActivitiesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

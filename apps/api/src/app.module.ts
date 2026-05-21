import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { ActivitiesModule } from './activities/activities.module';
import { HealthController } from './health.controller';
import { ShareCardModule } from './share-card/share-card.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(process.cwd(), 'apps/api/.env'),
      ],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/api/(.*)'],
    }),

    // Core modules (ORDER MATTERS FOR DI)
    PrismaModule,
    MailModule,
    UserModule,
    AuthModule,
    EventsModule,
    ArticlesModule,
    ActivitiesModule,
    ShareCardModule,
    LeaderboardModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

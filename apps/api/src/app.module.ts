import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ArticlesModule } from './articles/articles.module.js';
import { UserModule } from './user/user.module.js';
import { MailModule } from './mail/mail.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'; // Removed dirname as we'll use process.cwd()
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(process.cwd(), 'apps/api/.env'),
      ],
    }),
    // ONLY ONE ServeStaticModule is needed
    ServeStaticModule.forRoot({
      // process.cwd() points to the folder where you run 'npm run start'
      // This is usually the root of /apps/api/
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      // This allows the browser to view the files directly
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

// DELETE THE MANUALLY DEFINED fileURLToPath FUNCTION THAT WAS AT THE BOTTOM

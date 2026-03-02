import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('EPRX_BOOTSTRAP');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🛰️ DYNAMIC CORS CONFIGURATION
  // Pulls from Railway Service Variables, or defaults to a wide list for dev
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const origins = envOrigins
    ? envOrigins.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8081', // Expo Metro Bundler
        /\.railway\.app$/,
      ];

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 📦 MIDDLEWARE: Payload limits for image uploads
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // 📂 STATIC ASSETS: Mission Documentation & Profile Images
  const uploadPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  // 🛠️ GLOBAL CONFIG: Routing & Validation
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 🚀 SERVER INITIALIZATION
  const port = process.env.PORT || 3000;
  // Binding to 0.0.0.0 is critical for Railway/Cloud connectivity
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 ePRX UV1 Backend Uplink: http://0.0.0.0:${port}/api`);
  logger.log(`📂 Static Assets Mounted: /uploads/`);
  logger.log(`🛡️  CORS Active for: ${origins}`);
}
bootstrap();

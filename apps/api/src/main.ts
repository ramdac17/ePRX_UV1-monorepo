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
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const origins = envOrigins
    ? envOrigins.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8081',
        /\.railway\.app$/,
      ];

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  /**
   * 📂 STATIC ASSETS FIX:
   * Remove the trailing slash from the prefix.
   * Path-to-regexp v8 is very sensitive about trailing characters
   * when combined with global prefixes.
   */
  const uploadPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads', // Changed from '/uploads/' to '/uploads'
  });

  /**
   * 🛠️ GLOBAL CONFIG FIX:
   * Ensure the prefix is a simple string.
   * Do NOT use wildcards here.
   */
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000; // Binding to 0.0.0.0 is critical for Railway

  await app.listen(port, '0.0.0.0'); // Use 0.0.0.0 for external access

  logger.log(`🚀 ePRX UV1 Backend Uplink: http://0.0.0.0:${port}/api`);
  logger.log(`📂 Static Assets Mounted: /uploads`);
}
bootstrap();

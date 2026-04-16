import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json, urlencoded } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('EPRX_BOOTSTRAP');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const publicPath = join(process.cwd(), 'public');

  // 🛰️ DYNAMIC CORS CONFIGURATION
  const baseOrigins = envOrigins
    ? envOrigins.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8081',
        'http://127.0.0.1:3000',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (like Postman/Insomnia)
      if (!origin) return callback(null, true);

      // In development, allow everything for easier debugging
      if (!isProduction) return callback(null, true);

      const isAllowed = baseOrigins.some((allowed) =>
        origin.startsWith(allowed),
      );
      const isRailway = origin.endsWith('.railway.app');
      const isVercel = origin.endsWith('.vercel.app');
      const isLocalNetwork =
        origin.includes('192.168.') || origin.includes('10.0.');

      if (isAllowed || isRailway || isVercel || isLocalNetwork) {
        callback(null, true);
      } else {
        logger.error(`🚫 CORS_REJECTED_ORIGIN: ${origin}`);
        // Instead of throwing an Error (which can cause null status),
        // we pass false to let the browser handle the rejection naturally.
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  const uploadPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadPath, { prefix: '/uploads' });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 🛡️ SWAGGER CONFIGURATION
  const config = new DocumentBuilder()
    .setTitle('ePRX UV1 - CORE API')
    .setDescription('Mission-critical authentication and profile management')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useStaticAssets(publicPath, {
    prefix: '/', // Files will be at the root: /default-share.png
  });

  const port = process.env.PORT || 3001;

  // 🌍 0.0.0.0 is mandatory for Railway
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 ePRX UV1 Backend Uplink Active on Port ${port}`);
}

bootstrap();

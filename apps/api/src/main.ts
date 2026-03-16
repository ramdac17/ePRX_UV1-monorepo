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

  // 🛰️ DYNAMIC CORS CONFIGURATION
  const isProduction = process.env.NODE_ENV === 'production';
  const envOrigins = process.env.ALLOWED_ORIGINS;

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
      // 1. Always allow non-browser requests or development mode
      if (!origin || !isProduction) {
        return callback(null, true);
      }

      // 2. Define permission logic
      const isAllowed = baseOrigins.some((allowed) =>
        origin.startsWith(allowed),
      );
      const isRailway = origin.endsWith('.railway.app');
      const isVercel = origin.endsWith('.vercel.app'); // <--- ADD THIS
      const isLocalNetwork =
        origin.includes('192.168.') || origin.includes('10.0.');

      // 3. Single point of decision
      if (isAllowed || isRailway || isVercel || isLocalNetwork) {
        // <--- ADD isVercel HERE
        callback(null, true);
      } else {
        logger.error(`🚫 CORS_REJECTED_ORIGIN: ${origin}`);
        callback(new Error('CORS_POLICY_VIOLATION'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    optionsSuccessStatus: 204,
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  /**
   * 📂 STATIC ASSETS FIX:
   * Serving from root-level /uploads folder
   */
  const uploadPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads',
  });

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
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 3001; // Changed default to 3001 to avoid Next.js conflict

  // 🌍 Listen on 0.0.0.0 is mandatory for Railway visibility
  await app.listen(port, '0.0.0.0');

  const serverUrl = isProduction
    ? `https://eprxuv1-monorepo-production.up.railway.app/`
    : `http://localhost:${port}`;

  logger.log(`🚀 ePRX UV1 Backend Uplink: ${serverUrl}/api`);
  logger.log(`📑 API Documentation: ${serverUrl}/swagger`);
}

bootstrap();

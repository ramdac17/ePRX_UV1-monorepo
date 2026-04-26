import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dns from 'node:dns';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs'; // Added for path safety
import { json, urlencoded } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// 🛡️ CRITICAL: Force IPv4 first globally to bypass Railway ENETUNREACH errors
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const logger = new Logger('EPRX_BOOTSTRAP');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';
  const envOrigins = process.env.ALLOWED_ORIGINS;

  // Paths
  const publicPath = join(process.cwd(), 'public');
  const uploadPath = join(process.cwd(), 'uploads');

  // Ensure uploads directory exists (prevents static asset mount failure)
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
    logger.log('📁 Created uploads directory');
  }

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
      // Allow if no origin (server-to-server) or in development
      if (!origin || !isProduction) return callback(null, true);

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
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Body Parsing (matching ePRX UV1 telemetry data requirements)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Static Assets
  app.useStaticAssets(uploadPath, { prefix: '/uploads' });
  app.useStaticAssets(publicPath, { prefix: '/' });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 🛡️ SWAGGER CONFIGURATION (ePRX Mission Control)
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

  // Railway Port Handling
  const port = Number(process.env.PORT) || 3001;

  // 🌍 0.0.0.0 is mandatory for Railway external access
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 ePRX UV1 Backend Uplink Active on Port ${port}`);
}

bootstrap();

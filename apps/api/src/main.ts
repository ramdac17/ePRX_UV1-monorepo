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
  // Added '*' for development/testing to resolve UPLINK_LOST errors
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const origins = envOrigins
    ? envOrigins.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8081',
        /\.railway\.app$/,
        '*', // 🔓 Temporary allow-all to ensure Mobile App connectivity
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
   * Standardized for Path-to-regexp v8 compatibility.
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

  // 🛡️ SWAGGER CONFIGURATION (Aligned with JWT-auth protocol)
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
      'JWT-auth', // 🔑 Must match @ApiBearerAuth('JWT-auth') in controllers
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 3000;

  // 🌍 Listen on 0.0.0.0 is mandatory for Railway visibility
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 ePRX UV1 Backend Uplink: http://localhost:${port}/api`);
  logger.log(`📑 API Documentation: http://localhost:${port}/swagger`);
}

bootstrap();

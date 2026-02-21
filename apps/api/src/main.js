import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { json, urlencoded } from 'express';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Using 3001 as per your setup
    const port = process.env.PORT || 3000; // switch this to 3001 if the Web app breaks
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));
    // 1. STATIC ASSETS
    const uploadPath = join(process.cwd(), 'uploads');
    app.useStaticAssets(uploadPath, {
        prefix: '/uploads/', // URL will be http://localhost:3001/uploads/filename.jpg
    });
    // 2. CORS (Combined into one clean block)
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://192.168.0.152:3000',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    // 3. GLOBAL PREFIX
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(process.env.PORT || 3000, '0.0.0.0');
    console.log(`🚀 ePRX UV1 Backend: http://localhost:${port}/api`);
    console.log(`📂 Static Assets: http://localhost:${port}/uploads/`);
}
bootstrap();

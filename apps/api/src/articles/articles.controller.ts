import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // ✅ Required for Cloudinary
import { ArticlesService } from './articles.service.js';
import { AuthService } from '../auth/auth.service.js'; // ✅ Inject for cloud logic

@Controller(['articles', 'article'])
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // ✅ Change from diskStorage
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imageUrl = null;

    if (file) {
      // 🛰️ Upload to Cloudinary
      const cloudinaryResponse =
        await this.authService.uploadToCloudinary(file);
      imageUrl = cloudinaryResponse.secure_url;
    }

    return this.articlesService.create({
      ...body,
      image: imageUrl, // Now stores HTTPS URL
    });
  }

  @Get()
  async findAll() {
    return this.articlesService.getLatestArticles();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articlesService.getOne(id);
  }
}

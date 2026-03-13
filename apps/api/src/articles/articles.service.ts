import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  // Fixes the "getLatestArticles" error
  async getLatestArticles() {
    return this.prisma.article.findMany({
      take: 10, // Adjust as needed for the ePRX UV1 feed
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { username: true, firstName: true, lastName: true },
        },
      },
    });
  }

  // Fixes the "getArticleById" error
  async getArticleById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { username: true, firstName: true, lastName: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`ARTICLE_ID_${id}_NOT_FOUND`);
    }
    return article;
  }

  async create(data: {
    title: string;
    content: string;
    category: string;
    image: string | null;
    authorId: string;
  }) {
    try {
      return await this.prisma.article.create({
        data: {
          title: data.title,
          content: data.content,
          category: data.category,
          image: data.image, // Storing the Base64 string or file path
          authorId: data.authorId,
        },
        // Include author info in the return so the frontend can display it immediately
        include: {
          author: {
            select: { username: true, firstName: true, lastName: true },
          },
        },
      });
    } catch (error) {
      console.error('DATABASE_SAVE_ERROR:', error);
      throw new InternalServerErrorException(
        'FAILED_TO_SAVE_ARTICLE_TO_ARCHIVE',
      );
    }
  }

  async getOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }
}

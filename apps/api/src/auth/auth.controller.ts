import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  Get,
  HttpCode,
  Body,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

// 🛰️ Service & Guards
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

// 🏗️ DTOs
import { RegisterDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { VerifyOtpDto } from '../dto/verify-otp.dto.js';

import type { Express } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('EPRX_AUTH_CONTROLLER');

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.authService.getProfile(userId);
  }

  /**
   * 🛰️ UPLOAD_AVATAR (MEMORY STREAM VERSION)
   * This is now aligned with AuthModule's memoryStorage.
   */
  @Post('upload-avatar')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file')) // 👈 Clean Interceptor (Uses Module Config)
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('FILE_NOT_FOUND_IN_PAYLOAD');

    this.logger.log(
      `--- [ePRX_UV1] UPLOAD_INIT: ${file.originalname} (${file.size} bytes) ---`,
    );

    try {
      // Passes the memory buffer directly to Cloudinary
      const result = await this.authService.uploadToCloudinary(file);
      const userId = req.user.id || req.user.sub;

      return await this.authService.updateUserImage(userId, result.secure_url);
    } catch (error: any) {
      this.logger.error(`--- [ePRX_UV1] UPLOAD_FAILURE: ${error.message} ---`);
      throw new BadRequestException(`CLOUD_UPLOAD_FAILED: ${error.message}`);
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetDto);
  }

  @Get('test-cloudinary')
  async testCloudinary() {
    return this.authService.checkCloudinaryConnection();
  }
}

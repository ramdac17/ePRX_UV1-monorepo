import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
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
import { diskStorage } from 'multer';
import { extname } from 'path';
import 'multer';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('EPRX_AUTH_CONTROLLER');

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    this.logger.log(`--- [ePRX_UV1] LOGIN_ATTEMPT: ${loginDto.email} ---`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`--- [ePRX_UV1] SUCCESS: ${loginDto.email} ---`);
      return result;
    } catch (error: any) {
      this.logger.error(`--- [ePRX_UV1] LOGIN_FAILURE: ${error.message} ---`);
      throw error;
    }
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    this.logger.log(
      `--- [ePRX_UV1] REGISTRATION_ATTEMPT: ${registerDto.email} ---`,
    );
    try {
      // Logic: This now generates OTP and sets 60s expiry in DB
      const result = await this.authService.register(registerDto);
      this.logger.log(
        `--- [ePRX_UV1] REG_OTP_ISSUED: ${registerDto.email} ---`,
      );
      return result;
    } catch (error: any) {
      this.logger.error(`--- [ePRX_UV1] REG_FAILURE: ${error.message} ---`);
      throw error;
    }
  }

  /**
   * 🟢 NEW ENDPOINT: verify-otp
   * Matches the mobile app call: api.post("/auth/verify-otp", { email, otp })
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    this.logger.log(`--- [ePRX_UV1] VERIFICATION_ATTEMPT: ${body.email} ---`);
    try {
      const result = await this.authService.verifyOtp(body.email, body.otp);
      this.logger.log(`--- [ePRX_UV1] VERIFICATION_SUCCESS: ${body.email} ---`);
      return result;
    } catch (error: any) {
      this.logger.error(
        `--- [ePRX_UV1] VERIFICATION_FAILURE: ${error.message} ---`,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.authService.getProfile(userId);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException(
              'Only image files (jpg, jpeg, png) are allowed!',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file provided or invalid file type.');
    }

    const filePath = `/uploads/avatars/${file.filename}`;
    const userId = req.user.id || req.user.sub;

    try {
      await this.authService.updateUserImage(userId, filePath);
      return {
        success: true,
        message: 'IDENTITY_IMAGE_SYNCED',
        url: filePath,
      };
    } catch (error) {
      this.logger.error('--- [ePRX_UV1] DB_UPDATE_FAILED ---', error);
      throw new BadRequestException('Failed to update user profile image.');
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: any) {
    return this.authService.resetPassword(resetDto);
  }
}

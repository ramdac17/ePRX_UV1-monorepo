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
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

// Fixed Imports: Added .js extensions to match your bootstrap style
import { RegisterDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('EPRX_AUTH_CONTROLLER');

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'JWT_ISSUE_SUCCESS' })
  async login(@Body() loginDto: LoginDto) {
    // Fixed: Changed from 'any'
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
  @ApiResponse({ status: 201, description: 'REG_OTP_SENT_TO_EMAIL' })
  async register(@Body() registerDto: RegisterDto) {
    // Fixed: Changed from 'any'
    this.logger.log(
      `--- [ePRX_UV1] REGISTRATION_ATTEMPT: ${registerDto.email} ---`,
    );
    try {
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

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'OTP_VERIFIED_IDENTITY_CONFIRMED' })
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.authService.getProfile(userId);
  }

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
            new BadRequestException('Only image files allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: any, @Request() req: any) {
    if (!file) throw new BadRequestException('No file provided.');
    const filePath = `/uploads/avatars/${file.filename}`;
    const userId = req.user.id || req.user.sub;
    try {
      await this.authService.updateUserImage(userId, filePath);
      return { success: true, url: filePath };
    } catch (error) {
      throw new BadRequestException('Failed to update user profile image.');
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'RESET_OTP_SENT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'operative@eprx.com' } },
    },
  })
  async forgotPassword(@Body('email') email: string) {
    this.logger.log(`--- [ePRX_UV1] FORGOT_PASSWORD_REQUEST: ${email} ---`);
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'PASSWORD_RESET_SUCCESS' })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    // Fixed: Changed from 'any'
    this.logger.log(
      `--- [ePRX_UV1] RESET_PASSWORD_ATTEMPT: ${resetDto.email} ---`,
    );
    try {
      const result = await this.authService.resetPassword(resetDto);
      this.logger.log(
        `--- [ePRX_UV1] RESET_PASSWORD_SUCCESS: ${resetDto.email} ---`,
      );
      return result;
    } catch (error: any) {
      this.logger.error(`--- [ePRX_UV1] RESET_FAILURE: ${error.message} ---`);
      throw error;
    }
  }
}

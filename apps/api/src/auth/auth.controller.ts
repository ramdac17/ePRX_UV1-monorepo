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
import { VerifyOtpDto } from '../dto/verify-otp.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('EPRX_AUTH_CONTROLLER');

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'JWT_ISSUE_SUCCESS' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`--- [ePRX_UV1] LOGIN_ATTEMPT: ${loginDto.email} ---`);
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiResponse({ status: 201, description: 'REG_OTP_SENT_TO_EMAIL' })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(
      `--- [ePRX_UV1] REGISTRATION_ATTEMPT: ${registerDto.email} ---`,
    );
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'OTP_VERIFIED_IDENTITY_CONFIRMED' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    this.logger.log(
      `--- [ePRX_UV1] VERIFICATION_ATTEMPT: ${verifyOtpDto.email} ---`,
    );
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @ApiBearerAuth('JWT-auth') // Ensure this matches bootstrap config
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.authService.getProfile(userId);
  }

  @Post('upload-avatar')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
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
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('No file provided.');
    const filePath = `/uploads/avatars/${file.filename}`;
    const userId = req.user.id || req.user.sub;
    await this.authService.updateUserImage(userId, filePath);
    return { success: true, url: filePath };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    this.logger.log(`--- [ePRX_UV1] FORGOT_PASSWORD_REQUEST: ${email} ---`);
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    this.logger.log(
      `--- [ePRX_UV1] RESET_PASSWORD_ATTEMPT: ${resetDto.email} ---`,
    );
    return this.authService.resetPassword(resetDto);
  }
}

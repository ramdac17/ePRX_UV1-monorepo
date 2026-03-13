import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service.js';
import { UserService } from '../user/user.service.js';
import { MailService } from '../mail/mail.service.js';
import * as bcrypt from 'bcrypt';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
// @ts-ignore
import * as streamifier from 'streamifier';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('EPRX_AUTH_SERVICE');

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // ☁️ Initialize Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * ✅ FIX: Implemented missing token generation
   */
  private generateToken(payload: {
    sub: string;
    email: string;
    username: string;
  }) {
    const secret =
      this.configService.get<string>('JWT_SECRET') || 'DEV_SECRET_UV1_2026';
    return this.jwtService.sign(payload, { secret });
  }

  /**
   * ✅ FIX: Added missing getProfile (Resolves GitHub Actions Build Error)
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('USER_NOT_FOUND');

    const { password, verificationToken, tokenExpires, ...result } = user;
    return result;
  }

  async login(loginDto: any) {
    this.logger.log(`--- [ePRX_UV1] LOGIN_ATTEMPT: ${loginDto.email} ---`);
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('ACCESS_DENIED: Invalid Credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'IDENTITY_LOCKED: PLEASE VERIFY YOUR EMAIL.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const {
      password: _,
      verificationToken: __,
      tokenExpires: ___,
      ...result
    } = user;

    return {
      user: result,
      accessToken: this.generateToken(payload),
    };
  }

  async register(registerDto: any) {
    const { email, password, username, firstName, lastName, mobile } =
      registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new BadRequestException('USER_ALREADY_EXISTS');

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);

    await this.prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        mobile,
        password: hashedPassword,
        verificationToken: otp,
        tokenExpires: expiryDate,
        emailVerified: false,
      },
    });

    await this.mailService.sendVerificationEmail(email, otp);
    return { message: 'OTP_SENT', expires_in: '10m' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.verificationToken || !user.tokenExpires) {
      throw new BadRequestException('NO_ACTIVE_VERIFICATION_FOUND');
    }

    if (new Date() > user.tokenExpires) {
      throw new BadRequestException('CODE_EXPIRED_REQUEST_NEW_ONE');
    }

    if (user.verificationToken !== otp) {
      throw new BadRequestException('INVALID_CODE');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationToken: null,
        tokenExpires: null,
      },
    });

    return { status: 'VERIFIED', message: 'IDENTITY_ACTIVATED' };
  }

  /**
   * 🛰️ CLOUDINARY UPLOAD LOGIC
   */
  async uploadToCloudinary(file: any): Promise<UploadApiResponse> {
    this.logger.log(`🛰️ BUFFER_SIZE: ${file?.buffer?.length || 0} bytes`);
    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
        return reject(new BadRequestException('INVALID_FILE_BUFFER'));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'eprx_uv1_avatars',
          resource_type: 'auto',
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            console.error(
              '🔴 CLOUDINARY_SDK_ERROR_OBJECT:',
              JSON.stringify(error, null, 2),
            );
            this.logger.error(`Cloudinary Error: ${JSON.stringify(error)}`);
            return reject(error);
          }
          resolve(result as UploadApiResponse);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async updateUserImage(userId: string, imageUrl: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { image: imageUrl },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `--- [ePRX_UV1] DB_IMAGE_UPDATE_FAILURE: ${errorMessage} ---`,
      );
      throw new InternalServerErrorException('FAILED_TO_UPDATE_USER_IMAGE_REF');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('IDENTITY_NOT_FOUND');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);

    await this.prisma.user.update({
      where: { email },
      data: {
        verificationToken: otp,
        tokenExpires: expiryDate,
      },
    });

    await this.mailService.sendPasswordResetEmail(email, otp);
    return { message: 'RECOVERY_TOKEN_SENT' };
  }

  async resetPassword(resetDto: any) {
    const { email, otp, newPassword } = resetDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.verificationToken !== otp ||
      !user.tokenExpires ||
      new Date() > user.tokenExpires
    ) {
      throw new UnauthorizedException('TOKEN_INVALID_OR_EXPIRED');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        verificationToken: null,
        tokenExpires: null,
      },
    });

    return { status: 'PASSWORD_REGENERATED' };
  }

  async checkCloudinaryConnection() {
    try {
      // This calls the Cloudinary API to get folder info
      const result = await cloudinary.api.root_folders();
      return { status: 'CONNECTED', result };
    } catch (error) {
      console.error('🔴 CLOUDINARY_AUTH_ERROR:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { status: 'FAILED', error: errorMessage };
    }
  }
}

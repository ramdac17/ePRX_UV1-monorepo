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
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  private generateToken(payload: {
    sub: string;
    email: string;
    username: string;
    isAdmin: boolean;
  }) {
    const secret =
      this.configService.get<string>('JWT_SECRET') || 'DEV_SECRET_UV1_2026';
    return this.jwtService.sign(payload, { secret });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('USER_NOT_FOUND');

    // Destructure using updated schema field names
    const {
      password,
      verificationToken,
      verificationTokenExpires,
      resetToken,
      resetTokenExpires,
      ...result
    } = user;

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
      isAdmin: user.isAdmin,
    };

    const {
      password: _,
      verificationToken: __,
      verificationTokenExpires: ___,
      resetToken: ____,
      resetTokenExpires: _____,
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
        verificationTokenExpires: expiryDate, // ✅ Updated field
        emailVerified: false,
      },
    });

    await this.mailService.sendVerificationEmail(email, otp);
    return { message: 'OTP_SENT', expires_in: '10m' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.verificationToken || !user.verificationTokenExpires) {
      throw new BadRequestException('NO_ACTIVE_VERIFICATION_FOUND');
    }

    if (new Date() > user.verificationTokenExpires) {
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
        verificationTokenExpires: null, // ✅ Updated field
      },
    });

    return { status: 'VERIFIED', message: 'IDENTITY_ACTIVATED' };
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
        resetToken: otp, // ✅ Updated to use specific reset field
        resetTokenExpires: expiryDate, // ✅ Updated to use specific reset field
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
      user.resetToken !== otp || // ✅ Updated check
      !user.resetTokenExpires || // ✅ Updated check
      new Date() > user.resetTokenExpires
    ) {
      throw new UnauthorizedException('TOKEN_INVALID_OR_EXPIRED');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null, // ✅ Clean up reset fields
        resetTokenExpires: null,
      },
    });

    return { status: 'PASSWORD_REGENERATED' };
  }

  // --- Cloudinary logic remains unchanged as it was already correct ---
  async uploadToCloudinary(file: any): Promise<UploadApiResponse> {
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
        (error, result) => {
          if (error) return reject(error);
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
      throw new InternalServerErrorException('FAILED_TO_UPDATE_USER_IMAGE_REF');
    }
  }

  async checkCloudinaryConnection() {
    try {
      const result = await cloudinary.api.root_folders();
      return { status: 'CONNECTED', result };
    } catch (error) {
      return {
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

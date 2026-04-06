import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
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
    if (!user) throw new UnauthorizedException('USER NOT FOUND');

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
      throw new UnauthorizedException('ACCESS DENIED: Invalid Credentials');
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
    if (existingUser) throw new BadRequestException('USER ALREADY EXISTS');
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
        verificationTokenExpires: expiryDate,
        emailVerified: false,
      },
    });

    await this.mailService.sendVerificationEmail(email, otp);
    return { message: 'OTP_SENT', expires_in: '10m' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.verificationToken || !user.verificationTokenExpires) {
      throw new BadRequestException('NO ACTIVE VERIFICATION FOUND');
    }

    if (new Date() > user.verificationTokenExpires) {
      throw new BadRequestException('CODE EXPIRED - REQUEST NEW ONE');
    }

    if (user.verificationToken !== otp) {
      throw new BadRequestException('INVALID CODE');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return { status: 'VERIFIED', message: 'IDENTITY ACTIVATED' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('IDENTITY NOT FOUND');

    const token = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: expiryDate,
      },
    });

    await this.mailService.sendPasswordResetEmail(email, token);
    return { message: 'RECOVERY UPLINK DISPATCHED', expires_in: '1h' };
  }

  async resetPassword(resetDto: any) {
    const { email, token, newPassword } = resetDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      !user.resetToken ||
      user.resetToken !== token ||
      !user.resetTokenExpires ||
      new Date() > user.resetTokenExpires
    ) {
      throw new UnauthorizedException('INVALID OR EXPIRED RECOVERY TOKEN');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    this.logger.log(`--- [PRX UV] PASSWORD OVERRIDE SUCCESS: ${email} ---`);
    return { status: 'CREDENTIALS UPDATED', message: 'IDENTITY RESTORED' };
  }

  async uploadToCloudinary(file: any): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
        return reject(new BadRequestException('INVALID FILE BUFFER'));
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

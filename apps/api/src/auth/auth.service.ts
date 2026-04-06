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
import * as crypto from 'crypto'; // 🆕 Added for secure token generation
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

  // ... (generateToken, getProfile, login, register, verifyOtp remain unchanged)

  /**
   * 🛰️ REQUEST PASSWORD RESET (Link Flow)
   * Replaced 6-digit OTP with a secure hex token
   */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Security Best Practice: Don't throw 401 if user doesn't exist to prevent email harvesting.
    // However, keeping your logic if you prefer explicit errors.
    if (!user) throw new UnauthorizedException('IDENTITY NOT FOUND');

    // 1. Generate a secure random token (e.g., 'a1b2c3d4...')
    const token = crypto.randomBytes(32).toString('hex');

    // 2. Set expiry to 1 hour (standard for email links)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: expiryDate,
      },
    });

    // 3. Dispatch via MailService (which now handles the URL generation)
    await this.mailService.sendPasswordResetEmail(email, token);

    return { message: 'RECOVERY UPLINK DISPATCHED', expires_in: '1h' };
  }

  /**
   * 🛠️ RESET PASSWORD
   * Replaced 'otp' field with 'token'
   */
  async resetPassword(resetDto: any) {
    const { email, token, newPassword } = resetDto; // 🆕 Changed 'otp' to 'token'
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

  // ... (uploadToCloudinary, updateUserImage, checkCloudinaryConnection remain unchanged)
}

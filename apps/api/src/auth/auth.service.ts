import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // 🛰️ Added for Env access
import { PrismaService } from '../prisma.service.js';
import { UserService } from '../user/user.service.js';
import { MailService } from '../mail/mail.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('EPRX_AUTH_SERVICE');

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService, // 🏗️ Injected ConfigService
  ) {}

  /**
   * 🛡️ SAFE_SIGN: Helper to prevent 'secretOrPrivateKey' crashes.
   * Pulls from ENV first, falls back to a dev string.
   */
  private generateToken(payload: any): string {
    const secret =
      this.configService.get<string>('JWT_SECRET') || 'DEV_SECRET_UV1_2026';
    return this.jwtService.sign(payload, { secret });
  }

  // 1. UPDATED: Explicit Profile fetch logic
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('USER_NOT_FOUND');

    const {
      password,
      resetToken,
      resetTokenExpires,
      verificationToken,
      ...result
    } = user;

    return result;
  }

  async login(loginDto: any) {
    this.logger.log(`[ePRX_UV1] LOGIN_ATTEMPT: ${loginDto.email}`);
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('ACCESS_DENIED: Invalid Credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const { password: _, ...result } = user;

    return {
      user: result,
      // ✅ Using the safe sign helper
      access_token: this.generateToken(payload),
    };
  }

  async register(registerDto: any) {
    const { email, password, username, firstName, lastName, mobile } =
      registerDto;

    // Check for existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new UnauthorizedException('USER_ALREADY_EXISTS');

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set Expiry to 60 seconds from now
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + 60);

    // 3. Create/Update user with OTP and Expiry
    await this.prisma.user.upsert({
      where: { email },
      update: {
        verificationToken: otp,
        tokenExpires: expiryDate,
      },
      create: {
        email,
        username,
        firstName,
        lastName,
        mobile,
        password: hashedPassword,
        verificationToken: otp,
        tokenExpires: expiryDate,
      },
    });

    // 4. Send Email
    await this.mailService.sendVerificationEmail(email, otp);

    return { message: 'OTP_SENT', expires_in: '60s' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.verificationToken || !user.tokenExpires) {
      throw new UnauthorizedException('NO_ACTIVE_VERIFICATION_FOUND');
    }

    // 🟢 CHECK EXPIRY
    const now = new Date();
    if (now > user.tokenExpires) {
      throw new UnauthorizedException('CODE_EXPIRED_REQUEST_NEW_ONE');
    }

    // CHECK CODE MATCH
    if (user.verificationToken !== otp) {
      throw new UnauthorizedException('INVALID_CODE');
    }

    // 5. Success - Clear fields
    await this.prisma.user.update({
      where: { email },
      data: {
        verificationToken: null,
        tokenExpires: null,
      },
    });

    return { status: 'VERIFIED' };
  }

  async updateUserImage(userId: string, imagePath: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        image: imagePath,
      },
    });
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('IDENTITY_NOT_FOUND');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + 60); // 60s TTL

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
}

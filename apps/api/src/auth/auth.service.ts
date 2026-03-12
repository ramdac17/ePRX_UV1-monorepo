import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service.js';
import { UserService } from '../user/user.service.js';
import { MailService } from '../mail/mail.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('EPRX_AUTH_SERVICE');
  getProfile: any;

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateToken(payload: any): string {
    const secret =
      this.configService.get<string>('JWT_SECRET') || 'DEV_SECRET_UV1_2026';
    return this.jwtService.sign(payload, { secret });
  }

  async login(loginDto: any) {
    this.logger.log(`[ePRX_UV1] LOGIN_ATTEMPT: ${loginDto.email}`);
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('ACCESS_DENIED: Invalid Credentials');
    }

    // 🛡️ BLOCK: Enforce Email Verification
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
      accessToken: this.generateToken(payload), // Aligned with frontend expectation
    };
  }

  async register(registerDto: any) {
    const { email, password, username, firstName, lastName, mobile } =
      registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new UnauthorizedException('USER_ALREADY_EXISTS');

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Changed to 10m for better UX

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
        emailVerified: false, // Explicitly false on creation
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

    // ✅ THE FLIP: Atomic update to avoid password re-hashing
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

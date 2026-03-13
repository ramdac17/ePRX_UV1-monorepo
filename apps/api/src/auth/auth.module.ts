import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../prisma.module.js';
import { UserModule } from '../user/user.module.js';
import { MailModule } from '../mail/mail.module.js';
import { JwtStrategy } from '../auth/strategies/jwt.strategy.js';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express'; // 👈 ADD THIS IMPORT
import { memoryStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MulterModule.register({
      // 👈 This now has the correct reference
      storage: memoryStorage(),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

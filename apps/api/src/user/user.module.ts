import { Module, forwardRef } from '@nestjs/common'; // ✅ Added forwardRef
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { PrismaService } from '../prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  // ✅ Wrapped in forwardRef to resolve circular dependency with AuthModule
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}

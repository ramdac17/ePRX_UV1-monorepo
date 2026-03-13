import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
  BadRequestException,
  Body,
  Delete,
  UseGuards,
  UnauthorizedException,
  forwardRef,
  Req,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from './user.interface';

// DTO for updating user profile
export class UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  // add other profile fields as needed
}

// --- Controller ---
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /** DELETE: Remove user account (authenticated user only) */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Express.Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user || user.id !== id) {
      throw new UnauthorizedException('PURGE_DENIED');
    }

    await this.userService.purgeAccount(id);
    return {
      status: 'PURGE_COMPLETE',
      message: 'ALL_DATA_ERASED_FROM_EPRX_UV1',
    };
  }

  /** GET: Fetch user profile by ID */
  @Get('profile')
  async getProfile(@Query('id') id: string) {
    if (!id) throw new BadRequestException('User ID is required');

    const user = await this.userService.findUserById(id);
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      image: user.image,
    };
  }

  /** POST: Upload user profile image */
  @Post(':id/upload-image')
  @UseInterceptors(
    // ✅ Change 'image' to 'file' to match our frontend fix
    FileInterceptor('file', {
      storage: memoryStorage(), // ✅ Required for Cloudinary buffers
      fileFilter: (_, file, callback) => {
        if (!file.mimetype?.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files (JPG/PNG) are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File, // Should not be optional if you want a 400 on empty
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('FILE_NOT_FOUND_IN_REQUEST');
    }

    // 1. 🛰️ Send the buffer to Cloudinary via AuthService
    const cloudinaryResponse = await this.authService.uploadToCloudinary(file);

    // 2. 📝 Update the Database with the new Secure URL
    const updatedUser = await this.userService.updateProfile(
      id,
      body ?? {},
      cloudinaryResponse.secure_url, // Use the full https link from Cloudinary
    );

    return {
      message: 'PROFILE_SYNC_SUCCESSFUL',
      image: updatedUser.image,
      user: updatedUser,
    };
  }
}

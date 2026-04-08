import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'operative@eprx.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'The 6-digit OTP sent to email',
  })
  @IsString()
  @IsNotEmpty()
  token!: string; // 🆕 Change 'otp' to 'token'

  @ApiProperty({
    example: 'newSecurePassword123',
    description: 'Minimum 6 characters',
  })
  @IsString()
  @MinLength(6, { message: 'PASSWORD_TOO_SHORT_MIN_6' })
  newPassword!: string;
}

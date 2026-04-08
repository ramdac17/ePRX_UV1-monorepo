import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'operative@eprx.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '12345678',
    description: 'The secure hex token sent via the recovery uplink',
  })
  @IsString()
  @IsNotEmpty()
  token!: string; // 🆕 Change 'otp' to 'token'

  @ApiProperty({
    example: 'newSecurePassword123',
    description: 'Minimum 8 characters for enhanced security',
  })
  @IsString()
  @MinLength(8, { message: 'PASSWORD TOO SHORT MIN 8' })
  newPassword!: string;
}

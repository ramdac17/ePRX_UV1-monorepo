import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'operative@eprx.com' })
  @IsEmail({}, { message: 'INVALID_EMAIL_FORMAT' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'PASSWORD_TOO_SHORT_MIN_6' })
  password!: string;

  @ApiProperty({ example: 'ZeroOne' })
  @IsString()
  @IsNotEmpty({ message: 'USERNAME_REQUIRED' })
  username!: string;
}

import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'test-operative@eprx.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'The 6-digit code from your email',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP_MUST_BE_6_DIGITS' })
  otp!: string;
}

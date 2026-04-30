import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'c1daae6c67d68f5e561...',
    description: 'The secure hex token sent via the recovery uplink',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'newSecurePassword123',
    description: 'Minimum 8 characters for enhanced security',
  })
  @IsString()
  // Note: Your frontend check is 6 chars, but this DTO requires 8.
  // I recommend keeping 8 for better security.
  @MinLength(8, { message: 'PASSWORD TOO SHORT: MIN 8' })
  newPassword!: string;
}

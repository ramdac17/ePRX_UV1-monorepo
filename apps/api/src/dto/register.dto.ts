import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the operative',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'operator_01.png',
    description: 'Filename of the uploaded avatar',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

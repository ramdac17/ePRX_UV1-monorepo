import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @IsNotEmpty()
  distance!: number; // Matches Float in schema

  @IsNumber()
  @IsNotEmpty()
  duration!: number; // Matches Int in schema

  @IsString()
  @IsOptional()
  pace?: string;

  @IsNumber()
  @IsOptional()
  elevation?: number; // Matches Float in schema

  @IsArray()
  @IsOptional()
  coordinates?: any; // Stores the JSON array of lat/lng

  @IsString()
  @IsOptional()
  mapImageUrl?: string;

  @IsString()
  @IsOptional()
  shareImageUrl?: string;
}

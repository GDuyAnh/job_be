import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsNumber, IsArray, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'ABC University' })
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ description: 'Company email', example: 'contact@company.com' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'Company logo', example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  logo?: string;

  @ApiProperty({ description: 'Organization type', example: 'Public school' })
  @IsOptional()
  @IsString({ message: 'Organization type must be a string' })
  organizationType?: string;

  @ApiProperty({ description: 'Open positions', example: 5 })
  @IsOptional()
  @IsNumber({}, { message: 'Open positions must be a number' })
  openPositions?: number;

  @ApiProperty({ description: 'Social media links', example: ['https://facebook.com/company', 'https://linkedin.com/company'] })
  @IsOptional()
  @IsArray({ message: 'Social links must be an array' })
  socialLinks?: string[];

  @ApiProperty({ description: 'Company website', example: 'https://company.com' })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiProperty({ description: 'Province/city', example: 'Ho Chi Minh' })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @ApiProperty({ description: 'Detailed address', example: '123 Nguyen Van Linh, District 7' })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiProperty({ description: 'Company size', example: '50-100 employees' })
  @IsOptional()
  @IsString({ message: 'Company size must be a string' })
  companySize?: string;

  @ApiProperty({ description: 'Founded year', example: 2010 })
  @IsOptional()
  @IsNumber({}, { message: 'Founded year must be a number' })
  foundedYear?: number;

  @ApiProperty({ description: 'Company description', example: 'Technology company specializing in...' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
} 

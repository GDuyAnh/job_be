import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsNumber, IsArray, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Tên công ty', example: 'Trường Đại học ABC' })
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ description: 'Email công ty', example: 'contact@company.com' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'Logo công ty', example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  logo?: string;

  @ApiProperty({ description: 'Loại hình tổ chức', example: 'Trường công lập' })
  @IsOptional()
  @IsString({ message: 'Organization type must be a string' })
  organizationType?: string;

  @ApiProperty({ description: 'Vị trí đang tuyển', example: 5 })
  @IsOptional()
  @IsNumber({}, { message: 'Open positions must be a number' })
  openPositions?: number;

  @ApiProperty({ description: 'Link mạng xã hội', example: ['https://facebook.com/company', 'https://linkedin.com/company'] })
  @IsOptional()
  @IsArray({ message: 'Social links must be an array' })
  socialLinks?: string[];

  @ApiProperty({ description: 'Website công ty', example: 'https://company.com' })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiProperty({ description: 'Tỉnh/thành phố', example: 'Ho Chi Minh' })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @ApiProperty({ description: 'Địa chỉ chi tiết', example: '123 Nguyen Van Linh, District 7' })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiProperty({ description: 'Quy mô công ty', example: '50-100 nhân sự' })
  @IsOptional()
  @IsString({ message: 'Company size must be a string' })
  companySize?: string;

  @ApiProperty({ description: 'Năm thành lập', example: 2010 })
  @IsOptional()
  @IsNumber({}, { message: 'Founded year must be a number' })
  foundedYear?: number;

  @ApiProperty({ description: 'Mô tả công ty', example: 'Công ty chuyên về công nghệ...' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
} 

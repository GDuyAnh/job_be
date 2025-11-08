import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCompanyImageDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/company-image.jpg',
  })
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @IsNotEmpty({ message: 'Image URL is required' })
  url: string;
}

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'ABC University' })
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;
  
  @ApiPropertyOptional({ description: 'MST type ', example: '123456789' })
  @IsOptional()
  @ValidateIf((o, value) => value != null && value !== '')
  @IsString({ message: 'MST must be a string' })
  @Transform(({ value }) => value?.trim())
  mst?: string;

  @ApiProperty({
    description: 'Company logo',
    example: 'https://example.com/logo.png',
    required: true,
  })
  @IsString({ message: 'Logo must be a string' })
  @IsNotEmpty({ message: 'Logo is required' })
  logo: string;

  @ApiProperty({ description: 'Organization type ID', example: 1 })
  @IsNumber({}, { message: 'Organization type must be a number' })
  @IsNotEmpty({ message: 'Organization type is required' })
  @Type(() => Number)
  organizationType: number;

  @ApiProperty({
    description: 'Whether the company is shown',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isShow must be a boolean' })
  isShow?: boolean;

  @ApiProperty({
    description: 'Company approval status - true if waiting for admin approval',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'isWaiting must be a boolean' })
  isWaiting?: boolean;

  @ApiProperty({
    description: 'Facebook link',
    example: 'https://facebook.com/company',
  })
  @IsOptional()
  @ValidateIf((o, value) => value != null && value !== '')
  @IsUrl({}, { message: 'Facebook link must be a valid URL' })
  facebookLink?: string;

  @ApiProperty({
    description: 'Twitter link',
    example: 'https://twitter.com/company',
  })
  @IsOptional()
  @ValidateIf((o, value) => value != null && value !== '')
  @IsUrl({}, { message: 'Twitter link must be a valid URL' })
  twitterLink?: string;

  @ApiProperty({
    description: 'LinkedIn link',
    example: 'https://linkedin.com/company',
  })
  @IsOptional()
  @ValidateIf((o, value) => value != null && value !== '')
  @IsUrl({}, { message: 'LinkedIn link must be a valid URL' })
  linkedInLink?: string;

  @ApiProperty({
    description: 'Instagram link',
    example: 'https://instagram.com/company',
  })
  @IsOptional()
  @ValidateIf((o, value) => value != null && value !== '')
  @IsUrl({}, { message: 'Instagram link must be a valid URL' })
  instagramLink?: string;

  @ApiProperty({
    description: 'Company website',
    example: 'https://company.com',
  })
  @IsOptional()
  @ValidateIf((o, value) => value != null && value !== '')
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiProperty({
    description: 'Detailed address',
    example: '123 Nguyen Van Linh, District 7',
  })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({ description: 'Company size', example: 100 })
  @IsNumber({}, { message: 'Company size must be a number' })
  @IsNotEmpty({ message: 'Company size is required' })
  companySize: number;

  @ApiProperty({ description: 'Founded year', example: 2010 })
  @IsNumber({}, { message: 'Founded year must be a number' })
  @IsNotEmpty({ message: 'Founded year is required' })
  foundedYear: number;

  @ApiProperty({
    description: 'Company description',
    example: 'Technology company specializing in...',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    description: 'Company Insight',
    example: 'We value innovation and teamwork',
  })
  @IsOptional()
  @IsString({ message: 'Insight must be a string' })
  insight?: string;

  @ApiProperty({
    description: 'Company Overview',
    example: 'Founded in 2010, we have ...',
  })
  @IsOptional()
  @IsString({ message: 'Overview must be a string' })
  overview?: string;

  @ApiPropertyOptional({
    description: 'List of company images',
    type: [CreateCompanyImageDto],
    example: [
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Company images must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyImageDto)
  companyImages?: CreateCompanyImageDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({ description: 'Job title', example: 'Backend Developer' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    description: 'Job description',
    example: 'Develop backend services...',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ description: 'Job category', example: 1 })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Category must be a number' })
  category: number;

  @ApiProperty({ description: 'Job location', example: 1 })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Location must be a number' })
  location: number;

  @ApiProperty({ description: 'Type of employment', example: 1 })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Type of employment must be a number' })
  typeOfEmployment: number;

  @ApiProperty({ description: 'Experience level required', example: 1 })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Experience level must be a number' })
  experienceLevel: number;

  @ApiProperty({ description: 'Company ID', required: true })
  @IsOptional()
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Company ID must be a number' })
  companyId?: number;

  @ApiProperty({ description: 'User ID', required: true })
  @IsOptional()
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'User ID must be a number' })
  userId?: number;

  @ApiProperty({ description: 'Image logo', required: false })
  @IsOptional()
  @IsString({ message: 'Image logo must be a string' })
  imageLogo?: string;

  @ApiProperty({ description: 'Banner logo', required: false })
  @IsOptional()
  @IsString({ message: 'Banner logo must be a string' })
  bannerLogo?: string;

  @ApiProperty({ description: 'Posted date', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Posted date must be a valid date' })
  postedDate?: Date;

  @ApiProperty({ description: 'Application deadline', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Deadline must be a valid date' })
  deadline?: Date;

  @ApiProperty({ description: 'Salary Min', required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Salary Min must be a number' })
  salaryMin?: number;

  @ApiProperty({ description: 'Salary Max', required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Salary Max must be a number' })
  salaryMax?: number;

  @ApiProperty({ description: 'Salary Type', required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Salary Type must be a number' })
  salaryType?: number;

  @ApiProperty({ description: 'Salary Type Value', required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Salary Type Value must be a number' })
  salaryTypeValue?: number;

  @ApiProperty({ description: 'Benefits', required: false, type: [Number] })
  @IsOptional()
  @IsArray({ message: 'Benefits must be an array' })
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : value))
  @IsNumber({}, { each: true, message: 'Each benefit must be a number' })
  benefits?: number[];

  @ApiProperty({ description: 'Detailed description', required: false })
  @IsOptional()
  @IsString({ message: 'Detail description must be a string' })
  detailDescription?: string;

  @ApiProperty({
    description: 'Whether the job is featured',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is featured must be a boolean' })
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Job approval status - true if waiting for admin approval',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'isWaiting must be a boolean' })
  isWaiting?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsEmail,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({ description: 'Job title', example: 'Backend Developer' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    description: 'Job description',
    example: 'Develop backend services...',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ description: 'Job categories as comma-separated string (e.g., "1,2,3")' })
  @IsString({ message: 'Category must be a string' })
  category: string;

  @ApiProperty({ description: 'Job locations as comma-separated string (e.g., "1,2,3")' })
  @IsString({ message: 'Location must be a string' })
  location: string;

  @ApiProperty({ description: 'Type of employment', example: 1 })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Type of employment must be a number' })
  @IsNotEmpty({ message: 'Type of employment is required' })
  typeOfEmployment: number;

  @ApiProperty({ description: 'Experience level required', example: 1 })
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Experience level must be a number' })
  @IsNotEmpty({ message: 'Experience level is required' })
  experienceLevel: number;

  @ApiProperty({ description: 'Required qualification', example: 1 })
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Required qualification must be a number' })
  @IsNotEmpty({ message: 'Required qualification is required' })
  requiredQualification: number;

  @ApiProperty({ description: 'Gender requirements as comma-separated string (e.g., "1,2,3")' })
  @IsString({ message: 'Gender must be a string' })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: string;

  @ApiProperty({ description: 'Grade requirement', example: 1 })
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Grade must be a number' })
  @IsNotEmpty({ message: 'Grade is required' })
  grade: number;

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

  @ApiProperty({ description: 'Application deadline' })
  @IsDateString({}, { message: 'Deadline must be a valid date' })
  @IsNotEmpty({ message: 'Deadline is required' })
  deadline: Date;

  @ApiProperty({ description: 'Salary Min', required: false })
  @ValidateIf((o) => o.salaryType !== 5)
  @IsOptional()
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Salary Min must be a number' })
  @Min(0, { message: 'Salary Min must be non-negative' })
  salaryMin?: number;

  @ApiProperty({ description: 'Salary Max', required: false })
  @ValidateIf((o) => o.salaryType !== 5)
  @IsOptional()
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Salary Max must be a number' })
  @Min(0, { message: 'Salary Max must be non-negative' })
  salaryMax?: number;

  @ApiProperty({ description: 'Salary Type' })
  @Transform(({ value }) => (value !== null ? Number(value) : value))
  @IsNumber({}, { message: 'Salary Type must be a number' })
  @IsNotEmpty({ message: 'Salary Type is required' })
  salaryType: number;

  @ApiProperty({ description: 'Benefits as comma-separated string (e.g., "1,2,3")' })
  @IsString({ message: 'Benefits must be a string' })
  @IsNotEmpty({ message: 'Benefits is required' })
  benefits: string;

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

  @ApiProperty({ description: 'Contact email for job application' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({ description: 'Contact phone number for job application' })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  @ApiProperty({ description: 'Job address', example: '123 Main Street, District 1, Ho Chi Minh City' })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  @Transform(({ value }) => value?.trim())
  address: string;
}

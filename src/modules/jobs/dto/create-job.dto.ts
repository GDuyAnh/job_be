import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({ description: 'title', example: 'Backend Developer' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({ description: 'description', example: 'Develop backend services...' })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ description: 'Category' })
  @IsString({ message: 'Category must be a string' })
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @ApiProperty({ description: 'Location' })
  @IsString({ message: 'Location must be a string' })
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @ApiProperty({ description: 'typeOfEmployment' })
  @IsString({ message: 'Type of employment must be a string' })
  @IsNotEmpty({ message: 'Type of employment is required' })
  typeOfEmployment: string;

  @ApiProperty({ description: 'experienceLevel' })
  @IsString({ message: 'Experience level must be a string' })
  @IsNotEmpty({ message: 'Experience level is required' })
  experienceLevel: string;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  companyId?: number;

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

  @ApiProperty({ description: 'Deadline', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Deadline must be a valid date' })
  deadline?: Date;

  @ApiProperty({ description: 'Salary', required: false })
  @IsOptional()
  @IsString({ message: 'Salary must be a string' })
  salary?: string;

  @ApiProperty({ description: 'Benefits', required: false })
  @IsOptional()
  @IsString({ message: 'Benefits must be a string' })
  benefits?: string;

  @ApiProperty({ description: 'Detail description', required: false })
  @IsOptional()
  @IsString({ message: 'Detail description must be a string' })
  detailDescription?: string;

  @ApiProperty({ description: 'Is featured job', required: false, default: false })
  @IsOptional()
  @IsBoolean({ message: 'Is featured must be a boolean' })
  isFeatured?: boolean;
} 

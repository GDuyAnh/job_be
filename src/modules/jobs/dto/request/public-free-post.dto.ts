import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PublicCompanyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mst: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  organizationType?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;
}

export class PublicJobDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Comma-separated category ids' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ description: 'Comma-separated location ids' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  typeOfEmployment: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  experienceLevel?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  requiredQualification?: number;

  @ApiProperty({ required: false, description: 'Comma-separated gender ids' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  grade?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  postedDate?: string;

  @ApiProperty()
  @IsDateString()
  deadline: string;

  @ApiProperty({ description: 'Salary min (required if salaryType != 5)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number | null;

  @ApiProperty({ description: 'Salary max (required if salaryType != 5)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salaryMax?: number | null;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  salaryType: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  detailDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;
}

export class PublicFreePostRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mst: string;

  @ApiProperty({ type: PublicCompanyDto })
  @ValidateNested()
  @Type(() => PublicCompanyDto)
  company: PublicCompanyDto;

  @ApiProperty({ type: PublicJobDto })
  @ValidateNested()
  @Type(() => PublicJobDto)
  job: PublicJobDto;
}

export class PublicFreePostResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  redirectUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  access_token?: string;

  @ApiProperty({ required: false })
  user?: any;
}


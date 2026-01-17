import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobApplicationDto {
  @ApiProperty({ description: 'Job ID' })
  @IsInt()
  @IsNotEmpty()
  jobId: number;

  @ApiProperty({
    description:
      'User ID (optional - will be found or created if not provided)',
    required: false,
  })
  @IsInt()
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: 'Full Name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Phone Number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'CV URL', required: false })
  @IsString()
  @IsOptional()
  cvUrl?: string;

  @ApiProperty({ description: 'Cover Letter Text', required: false })
  @IsString()
  @IsOptional()
  coverLetter?: string;

  @ApiProperty({ description: 'Cover Letter URL', required: false })
  @IsString()
  @IsOptional()
  coverLetterUrl?: string;
}

import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullName: string;

  @ApiProperty({ description: 'Username' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  username: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Location (province/city) as string number enum',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description:
      'Expertise (categories) as comma-separated string number enum list',
    required: false,
  })
  @IsString()
  @IsOptional()
  expertise?: string;

  @ApiProperty({ description: 'CV URL', required: false })
  @IsString()
  @IsOptional()
  cvUrl?: string;

  @ApiProperty({ description: 'CV Original Filename', required: false })
  @IsString()
  @IsOptional()
  cvFileName?: string;

  @ApiProperty({ description: 'Cover Letter URL', required: false })
  @IsString()
  @IsOptional()
  coverLetterUrl?: string;

  @ApiProperty({ description: 'Cover Letter Original Filename', required: false })
  @IsString()
  @IsOptional()
  coverLetterFileName?: string;

  @ApiProperty({ description: 'Cover Letter Text', required: false })
  @IsString()
  @IsOptional()
  coverLetterText?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: 'Avatar Original Filename', required: false })
  @IsString()
  @IsOptional()
  avatarFileName?: string;
}

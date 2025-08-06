import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ description: 'Blog title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Blog description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Blog image URL' })
  @IsUrl()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ description: 'Blog URL slug' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Blog author', required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ description: 'Blog status', required: false, default: 'published' })
  @IsString()
  @IsOptional()
  status?: string;
} 
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsBoolean, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ description: 'Blog title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Blog content (rich text)' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Blog description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Blog image URL (cover image)' })
  @IsString()
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

  @ApiProperty({
    description: 'Blog status',
    required: false,
    default: 'published',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'SEO Title' })
  @IsString()
  @IsNotEmpty()
  titleSeo: string;

  @ApiProperty({ description: 'Meta description (max 1000 chars)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Mô tả meta không được vượt quá 1000 ký tự' })
  metaDescription: string;

  @ApiProperty({ description: 'Schema JSON (optional, max 1000 chars)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Schema không được vượt quá 1000 ký tự' })
  schema?: string;

  @ApiProperty({ description: 'Blog category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Display on homepage', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  displayOnHomepage?: boolean;
}

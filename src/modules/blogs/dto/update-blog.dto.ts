import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateBlogDto {
  @ApiProperty({ description: 'Blog title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Blog content (rich text)', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Blog description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Blog image URL (cover image)', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Blog URL slug', required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: 'Blog author', required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({
    description: 'Blog status',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'SEO Title', required: false })
  @IsString()
  @IsOptional()
  titleSeo?: string;

  @ApiProperty({ description: 'Meta description (max 1000 chars)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Mô tả meta không được vượt quá 1000 ký tự' })
  metaDescription?: string;

  @ApiProperty({ description: 'Schema JSON (optional, max 1000 chars)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Schema không được vượt quá 1000 ký tự' })
  schema?: string;

  @ApiProperty({ description: 'Blog category', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Display on homepage', required: false })
  @IsBoolean()
  @IsOptional()
  displayOnHomepage?: boolean;
}

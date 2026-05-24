import { IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SearchCompanyDto {
  @ApiProperty({
    description: 'Search keyword for company name',
    required: false,
  })
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    description: 'Organization type ID to filter companies',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Loại hình tổ chức phải là số' })
  @Type(() => Number)
  organizationType?: number;

  @ApiProperty({
    description: 'Location type ID to filter companies',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Loại địa điểm phải là số' })
  @Type(() => Number)
  location?: number;

  }

import { IsOptional, IsNumber, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SearchCompanyAdminDto {
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
  @IsNumber({}, { message: 'Organization type must be a number' })
  @Type(() => Number)
  organizationType?: number;

  @ApiProperty({
    description: 'Location type ID to filter companies',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Location type must be a number' })
  @Type(() => Number)
  location?: number;

  @ApiPropertyOptional({
    description: 'Filter by approval status ( ADMIN Only )',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isWaiting?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by featured (true = only featured)',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  isFeatured?: string;

  @ApiPropertyOptional({
    description: 'Filter by has banner image (true = only companies with banner)',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  hasBanner?: string;
}

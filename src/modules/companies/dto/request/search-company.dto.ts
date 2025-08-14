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

  @ApiPropertyOptional({ description: 'Only get shown company' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isShow?: boolean;
}

import { IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SearchCompanyDto {
  @ApiProperty({
    description: 'Organization type ID to filter companies',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Organization type must be a number' })
  @Type(() => Number)
  organizationType?: number;

  @ApiPropertyOptional({ description: 'Only get shown company' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isShow?: boolean;
}

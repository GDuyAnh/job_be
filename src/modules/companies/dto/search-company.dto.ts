import { IsOptional, IsString , IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchCompanyDto {
  @ApiProperty({
    description: 'Organization type to filter companies',
    example: 'Public school',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Organization type must be a string' })
  organizationType?: string;

  @ApiPropertyOptional({ description: 'Only get shown company' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isShow?: boolean;
}

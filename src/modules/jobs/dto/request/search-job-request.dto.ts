import { IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchJobDto {
  @ApiPropertyOptional({ description: 'Search keyword for job title' })
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Job category (number ID)' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber({}, { message: 'Category must be a number' })
  category?: number;

  @ApiPropertyOptional({ description: 'Work location (number ID)' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber({}, { message: 'Location must be a number' })
  location?: number;

  @ApiPropertyOptional({
    description: 'Type of employment (array of number IDs)',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @IsNumber(
    {},
    { each: true, message: 'Each type of employment must be a number' },
  )
  typeOfEmployment?: number[];

  @ApiPropertyOptional({
    description: 'Experience level (array of number IDs)',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @IsNumber(
    {},
    { each: true, message: 'Each experience level must be a number' },
  )
  experienceLevel?: number[];

  @ApiPropertyOptional({ description: 'Only get featured jobs' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'CompanyId (number ID)' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber({}, { message: 'CompanyId must be a number' })
  companyId?: number;

}

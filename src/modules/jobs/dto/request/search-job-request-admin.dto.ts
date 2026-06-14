import { IsOptional, IsNumber, IsArray, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchJobAdminDto {
  @ApiPropertyOptional({ description: 'Search keyword for job title' })
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Job category (array of number IDs)',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const raw = Array.isArray(value) ? value : [value];
    const nums = raw
      .flatMap((v) => String(v).split(','))
      .map((v) => Number(v.trim()))
      .filter((n) => !Number.isNaN(n));
    return nums.length ? nums : undefined;
  })
  @IsNumber({}, { each: true, message: 'Mỗi danh mục phải là số' })
  category?: number[];

  @ApiPropertyOptional({
    description: 'Work location (array of number IDs)',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const raw = Array.isArray(value) ? value : [value];
    const nums = raw
      .flatMap((v) => String(v).split(','))
      .map((v) => Number(v.trim()))
      .filter((n) => !Number.isNaN(n));
    return nums.length ? nums : undefined;
  })
  @IsNumber({}, { each: true, message: 'Mỗi địa điểm phải là số' })
  location?: number[];

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
    { each: true, message: 'Mỗi hình thức làm việc phải là số' },
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
    { each: true, message: 'Mỗi mức kinh nghiệm phải là số' },
  )
  experienceLevel?: number[];

  @ApiPropertyOptional({
    description: 'Filter by job status: ADMIN_REVIEW | PENDING | APPROVED | REJECTED',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined)
  status?: string;

  @ApiPropertyOptional({ description: 'CompanyId (number ID)' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber({}, { message: 'Mã công ty phải là số' })
  companyId?: number;
}

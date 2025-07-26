import { IsOptional, IsString , IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchJobDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo tiêu đề' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Nghề nghiệp' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Nơi làm việc' })
  @IsOptional()
  @IsString()
  location?: string;

  
  @ApiPropertyOptional({ description: 'Hình thức làm việc' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  typeOfEmployment?: string[];
  
  
  @ApiPropertyOptional({ description: 'Kinh nghiệm làm việc' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  experienceLevel?: string[];
}

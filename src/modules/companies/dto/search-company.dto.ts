import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchCompanyDto {
  @ApiProperty({ description: 'Loại hình tổ chức', required: false })
  @IsOptional()
  @IsString()
  organizationType?: string;
} 


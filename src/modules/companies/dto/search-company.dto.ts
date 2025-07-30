import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchCompanyDto {
  @ApiProperty({ description: 'Organization type', required: false })
  @IsOptional()
  @IsString()
  organizationType?: string;
} 


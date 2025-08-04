import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class SearchCompanyDto {
  @ApiProperty({ 
    description: 'Organization type to filter companies', 
    example: 'Public school',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Organization type must be a string' })
  organizationType?: string;
} 


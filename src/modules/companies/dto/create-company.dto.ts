import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Tên công ty', example: 'Trường Đại học ABC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Logo công ty', example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({ description: 'Loại hình tổ chức', example: 'Trường công lập' })
  @IsOptional()
  @IsString()
  organizationType?: string;

  @ApiProperty({ description: 'Vị trí đang tuyển', example: '5 vị trí' })
  @IsOptional()
  @IsString()
  openPositions?: number;
} 

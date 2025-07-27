import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../company.entity';

export class CompanyResponseDto {
  @ApiProperty({ description: 'Tên công ty' })
  name: string;

  @ApiProperty({ description: 'Logo công ty' })
  logo: string;

  @ApiProperty({ description: 'Loại hình tổ chức' })
  organizationType: string;

  @ApiProperty({ description: 'Vị trí đang tuyển' })
  openPositions: string;

  constructor(company: Company) {
    this.name = company.name;
    this.logo = company.logo;
    this.organizationType = company.organizationType;
    this.openPositions = company.openPositions;
  }
} 
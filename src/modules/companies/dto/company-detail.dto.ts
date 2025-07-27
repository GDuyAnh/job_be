import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../company.entity';
import { CompanyDetail } from '../company-detail.entity';

export class CompanyDetailDto {
 
  @ApiProperty({ description: 'Tên công ty' })
  name: string;

  @ApiProperty({ description: 'Logo công ty' })
  logo: string;

  @ApiProperty({ description: 'Loại hình tổ chức' })
  organizationType: string;

  @ApiProperty({ description: 'Vị trí đang tuyển' })
  openPositions: string;

  // Company detail fields
  @ApiProperty({ description: 'Link mạng xã hội' })
  socialLinks: string[];

  @ApiProperty({ description: 'Website công ty' })
  website: string;

  @ApiProperty({ description: 'Tỉnh/thành phố' })
  location: string;

  @ApiProperty({ description: 'Địa chỉ chi tiết' })
  address: string;

  @ApiProperty({ description: 'Quy mô công ty' })
  companySize: string;

  @ApiProperty({ description: 'Năm thành lập' })
  foundedYear: number;

  @ApiProperty({ description: 'Email công ty' })
  email: string;

  @ApiProperty({ description: 'Mô tả công ty' })
  description: string;

  constructor(company: Company, detail: CompanyDetail) {
    this.name = company.name;
    this.logo = company.logo;
    this.organizationType = company.organizationType;
    this.openPositions = company.openPositions;

    if (detail) {
      this.socialLinks = detail.socialLinks;
      this.website = detail.website;
      this.location = detail.location;
      this.address = detail.address;
      this.companySize = detail.companySize;
      this.foundedYear = detail.foundedYear;
      this.email = detail.email;
      this.description = detail.description;
    }
  }
} 
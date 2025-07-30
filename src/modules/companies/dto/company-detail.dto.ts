import { ApiProperty } from '@nestjs/swagger';

export class CompanyDetailDto {
  @ApiProperty({ description: 'Tên công ty' })
  name: string;

  @ApiProperty({ description: 'Logo công ty' })
  logo: string;

  @ApiProperty({ description: 'Loại hình tổ chức' })
  organizationType: string;

  @ApiProperty({ description: 'Vị trí đang tuyển' })
  openPositions: number;

  // Company detail fields
  @ApiProperty({ description: 'Link mạng xã hội', nullable: true })
  socialLinks: string[] | null;

  @ApiProperty({ description: 'Website công ty', nullable: true })
  website: string | null;

  @ApiProperty({ description: 'Tỉnh/thành phố', nullable: true })
  location: string | null;

  @ApiProperty({ description: 'Địa chỉ chi tiết', nullable: true })
  address: string | null;

  @ApiProperty({ description: 'Quy mô công ty', nullable: true })
  companySize: string | null;

  @ApiProperty({ description: 'Năm thành lập', nullable: true })
  foundedYear: number | null;

  @ApiProperty({ description: 'Email công ty' })
  email: string;

  @ApiProperty({ description: 'Mô tả công ty', nullable: true })
  description: string | null;

  constructor(company: any) {
    this.name = company.name;
    this.logo = company.logo;
    this.organizationType = company.organizationType;
    this.openPositions = company.openPositions;
    this.socialLinks = company.socialLinks;
    this.website = company.website;
    this.location = company.location;
    this.address = company.address;
    this.companySize = company.companySize;
    this.foundedYear = company.foundedYear;
    this.email = company.email;
    this.description = company.description;
  }
} 
import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../company.entity';

export class CompanyResponseDto {
  @ApiProperty({ description: 'ID công ty' })
  id: number;

  @ApiProperty({ description: 'Tên công ty' })
  name: string;

  @ApiProperty({ description: 'Logo công ty', nullable: true })
  logo: string | null;

  @ApiProperty({ description: 'Loại hình tổ chức', nullable: true })
  organizationType: string | null;

  @ApiProperty({ description: 'Vị trí đang tuyển', nullable: true })
  openPositions: number | null;

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

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  constructor(company: Company) {
    this.id = company.id;
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
    this.createdAt = company.createdAt;
    this.updatedAt = company.updatedAt;
  }
} 
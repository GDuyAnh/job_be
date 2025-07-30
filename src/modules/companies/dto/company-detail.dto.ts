import { ApiProperty } from '@nestjs/swagger';

export class CompanyDetailDto {
  @ApiProperty({ description: 'Company name' })
  name: string;

  @ApiProperty({ description: 'Company logo' })
  logo: string;

  @ApiProperty({ description: 'Organization type' })
  organizationType: string;

  @ApiProperty({ description: 'Open positions' })
  openPositions: number;

  // Company detail fields
  @ApiProperty({ description: 'Social media links', nullable: true })
  socialLinks: string[] | null;

  @ApiProperty({ description: 'Company website', nullable: true })
  website: string | null;

  @ApiProperty({ description: 'Province/city', nullable: true })
  location: string | null;

  @ApiProperty({ description: 'Detailed address', nullable: true })
  address: string | null;

  @ApiProperty({ description: 'Company size', nullable: true })
  companySize: string | null;

  @ApiProperty({ description: 'Founded year', nullable: true })
  foundedYear: number | null;

  @ApiProperty({ description: 'Company email' })
  email: string;

  @ApiProperty({ description: 'Company description', nullable: true })
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
import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../company.entity';

export class CompanyResponseDto {
  @ApiProperty({ description: 'Company ID' })
  id: number;

  @ApiProperty({ description: 'Company name' })
  name: string;

  @ApiProperty({ description: 'Company logo', nullable: true })
  logo: string | null;

  @ApiProperty({ description: 'Organization type', nullable: true })
  organizationType: string | null;

  @ApiProperty({ description: 'Open positions', nullable: true })
  openPositions: number | null;

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

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
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
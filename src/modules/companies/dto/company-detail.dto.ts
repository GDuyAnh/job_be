import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../company.entity';

export class CompanyDetailDto {
  @ApiProperty({ description: 'Company ID' })
  id: number;

  @ApiProperty({ description: 'Company name' })
  name: string;

  @ApiProperty({ description: 'Company logo' })
  logo: string;

  @ApiProperty({ description: 'Organization type (e.g., Public school, Catholic)' })
  organizationType: string;

  @ApiProperty({ description: 'Number of open positions', nullable: true })
  openPositions: number | null;

  // Social media links (divided fields)
  @ApiProperty({ description: 'Facebook link', nullable: true })
  facebookLink: string | null;

  @ApiProperty({ description: 'Twitter link', nullable: true })
  twitterLink: string | null;

  @ApiProperty({ description: 'LinkedIn link', nullable: true })
  linkedInLink: string | null;

  @ApiProperty({ description: 'Instagram link', nullable: true })
  instagramLink: string | null;

  @ApiProperty({ description: 'Company website', nullable: true })
  website: string | null;

  @ApiProperty({ description: 'Detailed address', nullable: true })
  address: string | null;

  @ApiProperty({ description: 'Company size (e.g., 50-100 employees)', nullable: true })
  companySize: number | null;

  @ApiProperty({ description: 'Founded year', nullable: true })
  foundedYear: number | null;

  @ApiProperty({ description: 'Company email', nullable: true })
  email: string | null;

  @ApiProperty({ description: 'Company description', nullable: true })
  description: string | null;

  constructor(company: Company) {
    this.id = company.id;
    this.name = company.name;
    this.logo = company.logo;
    this.organizationType = company.organizationType;
    this.openPositions = company.openPositions ?? null;

    this.facebookLink = company.facebookLink ?? null;
    this.twitterLink = company.twitterLink ?? null;
    this.linkedInLink = company.linkedInLink ?? null;
    this.instagramLink = company.instagramLink ?? null;

    this.website = company.website ?? null;
    this.address = company.address ?? null;
    this.companySize = company.companySize ?? null;
    this.foundedYear = company.foundedYear ?? null;
    this.email = company.email ?? null;
    this.description = company.description ?? null;
  }
}

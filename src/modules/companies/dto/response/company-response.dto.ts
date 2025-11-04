import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../../company.entity';
import { CompanyImageDto } from './company-image.dto';

export class CompanyResponseDto {
  @ApiProperty({ description: 'Company ID' })
  id: number;

  @ApiProperty({ description: 'Company name' })
  name: string;

  @ApiProperty({ description: 'Company mst' })
  mst: string;
  

  @ApiProperty({ description: 'Company logo', nullable: true })
  logo: string | null;

  @ApiProperty({
    description: 'Number of open positions (jobs)',
    nullable: true,
  })
  openPositions?: number;

  @ApiProperty({
    description: 'Organization type (ID)',
    nullable: true,
    example: 1,
  })
  organizationType: number | null;

  @ApiProperty({ description: 'Whether the company is shown' })
  isShow: boolean;

  @ApiProperty({
    description: 'Company approval status - true if waiting for admin approval',
  })
  isWaiting: boolean;

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

  @ApiProperty({ description: 'Company size', nullable: true })
  companySize: number | null;

  @ApiProperty({ description: 'Founded year', nullable: true })
  foundedYear: number | null;

  @ApiProperty({ description: 'Company email' })
  email: string;

  @ApiProperty({ description: 'Company description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Company Insight', nullable: true })
  insight: string | null;

  @ApiProperty({ description: 'Company Overview', nullable: true })
  overview: string | null;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  @ApiProperty({
    description: 'List of images about company',
    type: [CompanyImageDto],
  })
  companyImages: CompanyImageDto[];

  constructor(company: Company, openPositions?: number) {
    this.id = company.id;
    this.name = company.name;
    this.mst = company.mst;
    this.logo = company.logo;
    this.organizationType = company.organizationType;
    this.isShow = company.isShow;
    this.isWaiting = company.isWaiting;
    this.facebookLink = company.facebookLink;
    this.twitterLink = company.twitterLink;
    this.linkedInLink = company.linkedInLink;
    this.instagramLink = company.instagramLink;
    this.website = company.website;
    this.address = company.address;
    this.companySize = company.companySize;
    this.foundedYear = company.foundedYear;
    this.email = company.email;
    this.description = company.description;
    this.insight = company.insight;
    this.overview = company.overview;
    this.createdAt = company.createdAt;
    this.updatedAt = company.updatedAt;

    this.openPositions = openPositions ?? 0;

    this.companyImages =
      company.companyImages?.map((img) => ({
        id: img.id,
        url: img.url,
      })) ?? [];
  }
}

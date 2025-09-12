import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../../company.entity';
import { CompanyJobSummaryDto } from './company-job-summary.dto';
import { CompanyImageDto } from './company-image.dto';

export class CompanyDetailDto {
  @ApiProperty({ description: 'Company ID' })
  id: number;

  @ApiProperty({ description: 'Company name' })
  name: string;

  @ApiProperty({ description: 'Company logo' })
  logo: string;

  @ApiProperty({
    description: 'Organization type (ID)',
    nullable: true,
    example: 1,
  })
  organizationType: number | null;

  @ApiProperty({ description: 'Company MST' })
  mst: number | null;

  @ApiProperty({ description: 'Whether the company is shown' })
  isShow: boolean;

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

  @ApiProperty({
    description: 'Company size (e.g., 50-100 employees)',
    nullable: true,
  })
  companySize: number | null;

  @ApiProperty({ description: 'Founded year', nullable: true })
  foundedYear: number | null;

  @ApiProperty({ description: 'Company email', nullable: true })
  email: string | null;

  @ApiProperty({ description: 'Company description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Company Insight', nullable: true })
  insight: string | null;

  @ApiProperty({ description: 'Company Overview', nullable: true })
  overview: string | null;

  @ApiProperty({
    description: 'List of jobs belonging to this company',
    type: [CompanyJobSummaryDto],
  })
  jobs: CompanyJobSummaryDto[];

  @ApiProperty({
    description: 'List of images about company',
    type: [CompanyImageDto],
  })
  companyImages: CompanyImageDto[];

  constructor(company: Company, jobs?: CompanyJobSummaryDto[]) {
    this.id = company.id;
    this.name = company.name;
    this.logo = company.logo;
    this.organizationType = company.organizationType;
    this.mst = company.mst;
    this.isShow = company.isShow;

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
    this.insight = company.insight ?? null;
    this.overview = company.overview ?? null;

    this.jobs = jobs || [];
    this.companyImages =
      company.companyImages?.map((img) => ({
        id: img.id,
        url: img.url,
      })) ?? [];
  }
}

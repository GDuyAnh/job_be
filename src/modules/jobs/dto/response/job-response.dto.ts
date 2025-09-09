import { ApiProperty } from '@nestjs/swagger';

export class JobResponseDto {
  @ApiProperty({ description: 'Job ID' })
  id: number;

  @ApiProperty({ description: 'Job title' })
  title: string;

  @ApiProperty({ description: 'Job description' })
  description: string;

  @ApiProperty({ description: 'Job category ID' })
  category: number;

  @ApiProperty({ description: 'Job location ID' })
  location: number;

  @ApiProperty({ description: 'Type of employment ID' })
  typeOfEmployment: number;

  @ApiProperty({ description: 'Experience level ID' })
  experienceLevel: number;

  @ApiProperty({ description: 'Company ID' })
  companyId: number;

  @ApiProperty({ description: 'Company name', required: false })
  companyName?: string;

  @ApiProperty({ description: 'Company logo', required: false })
  companyLogo?: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Job approval status , true if waiting for admin to approve',
  })
  isWaiting: boolean;

  @ApiProperty({ description: 'Whether the job is featured' })
  isFeatured: boolean;

  @ApiProperty({ description: 'Image logo' })
  imageLogo: string;

  @ApiProperty({ description: 'Banner logo' })
  bannerLogo: string;

  @ApiProperty({ description: 'Posted date' })
  postedDate: Date;

  @ApiProperty({ description: 'Application deadline' })
  deadline: Date;

  @ApiProperty({ description: 'Minimum salary', example: 1000 })
  salaryMin: number;

  @ApiProperty({ description: 'Maximum salary', example: 3000 })
  salaryMax: number;

  @ApiProperty({
    description: 'Salary type. Example: 1 = MONTH, 2 = WEEK, 3 = NEGOTIABLE',
    example: 1,
  })
  salaryType: number;

  @ApiProperty({ description: 'Salary type value', example: 10 })
  salaryTypeValue: number;

  @ApiProperty({ description: 'Benefit IDs', type: [Number], required: false })
  benefits: number[];

  @ApiProperty({ description: 'Detailed description (HTML)' })
  detailDescription: string;

  constructor(job: any) {
    this.id = job.id;
    this.title = job.title;
    this.description = job.description;
    this.category = job.category;
    this.location = job.location;
    this.typeOfEmployment = job.typeOfEmployment;
    this.experienceLevel = job.experienceLevel;
    this.companyId = job.companyId;
    this.companyName = job.company?.name || '';
    this.companyLogo = job.company?.logo || '';
    this.createdAt = job.createdAt;
    this.updatedAt = job.updatedAt;
    this.isWaiting = job.isWaiting;
    this.isFeatured = job.isFeatured;
    this.imageLogo = job.imageLogo;
    this.bannerLogo = job.bannerLogo;
    this.postedDate = job.postedDate;
    this.deadline = job.deadline;
    this.salaryMin = job.salaryMin ?? 0;
    this.salaryMax = job.salaryMax ?? 0;
    this.salaryType = job.salaryType ?? 0;
    this.salaryTypeValue = job.salaryTypeValue ?? 0;
    this.detailDescription = job.detailDescription;
    this.benefits = Array.isArray(job.jobBenefits)
      ? job.jobBenefits.map((jb: any) => jb.benefitId)
      : [];
  }
}

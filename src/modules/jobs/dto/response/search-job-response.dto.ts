import { ApiProperty } from '@nestjs/swagger';

export class JobSearchResponseDto {
  @ApiProperty({ description: 'Job ID' })
  id: number;

  @ApiProperty({ description: 'Job title' })
  title: string;

  @ApiProperty({ description: 'Job description' })
  description: string;

  @ApiProperty({ description: 'Job category' })
  category: string;

  @ApiProperty({ description: 'Job location' })
  location: string;

  @ApiProperty({ description: 'Type of employment' })
  typeOfEmployment: string;

  @ApiProperty({ description: 'Experience level required' })
  experienceLevel: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'Company logo' })
  companyLogo: string;

  @ApiProperty({ description: 'Salary' })
  salary: string;

  @ApiProperty({ description: 'Whether the job is featured' })
  isFeatured: boolean;

  @ApiProperty({ description: 'Benefit IDs', type: [Number], required: false })
  benefits: number[];

  constructor(job: any) {
    this.id = job.id;
    this.title = job.title;
    this.description = job.description;
    this.category = job.category;
    this.location = job.location;
    this.typeOfEmployment = job.typeOfEmployment;
    this.experienceLevel = job.experienceLevel;
    this.companyName = job.company?.name || '';
    this.companyLogo = job.company?.logo || '';
    this.salary = job.detail?.salary || '';
    this.isFeatured = job.isFeatured;
    this.benefits = Array.isArray(job.jobBenefits)
      ? job.jobBenefits.map((jb: any) => jb.benefitId)
      : [];
  }
}

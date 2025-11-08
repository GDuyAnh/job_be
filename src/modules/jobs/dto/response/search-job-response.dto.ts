import { ApiProperty } from '@nestjs/swagger';

export class JobSearchResponseDto {
  @ApiProperty({ description: 'Job ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Job title', example: 'Backend Developer' })
  title: string;

  @ApiProperty({
    description: 'Job description',
    example: 'Develop backend services...',
  })
  description: string;

  @ApiProperty({ description: 'Job categories as comma-separated string (e.g., "1,2,3")', example: '1,2' })
  category: string;

  @ApiProperty({ description: 'Job locations as comma-separated string (e.g., "1,2,3")', example: '1,2' })
  location: string;

  @ApiProperty({ description: 'Type of employment ID', example: 1 })
  typeOfEmployment: number;

  @ApiProperty({ description: 'Experience level ID', example: 3 })
  experienceLevel: number;

  @ApiProperty({ description: 'Company name', example: 'Tech Corp' })
  companyName: string;

  @ApiProperty({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png',
  })
  companyLogo: string;

  @ApiProperty({
    description: 'Minimum salary',
    example: 1000,
    required: false,
  })
  salaryMin?: number;

  @ApiProperty({
    description: 'Maximum salary',
    example: 3000,
    required: false,
  })
  salaryMax?: number;

  @ApiProperty({ description: 'Salary type ID', example: 1, required: false })
  salaryType?: number;

  @ApiProperty({ description: 'Whether the job is featured', example: true })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Benefit IDs',
    type: [Number],
    required: false,
    example: [1, 2, 3],
  })
  benefits?: string | null;

  @ApiProperty({ description: 'Job address', example: '123 Main Street, District 1, Ho Chi Minh City' })
  address: string;

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
    this.salaryMin = job.salaryMin ?? null;
    this.salaryMax = job.salaryMax ?? null;
    this.salaryType = job.salaryType ?? null;
    this.isFeatured = job.isFeatured ?? false;
    this.benefits = job.benefits || null;
    this.address = job.address || '';
  }
}

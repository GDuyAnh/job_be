import { ApiProperty } from '@nestjs/swagger';

export class AdminApplicationResponseDto {
  @ApiProperty({ description: 'Application ID' })
  id: number;

  @ApiProperty({ description: 'Job title' })
  jobTitle: string;

  @ApiProperty({ description: 'Job ID' })
  jobId: number;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'Company logo URL', required: false })
  companyLogo?: string;

  @ApiProperty({ description: 'Applicant user ID' })
  userId: number;

  @ApiProperty({ description: 'Applicant full name' })
  applicantName: string;

  @ApiProperty({ description: 'Applicant phone' })
  phone: string;

  @ApiProperty({ description: 'Applicant email' })
  email: string;

  @ApiProperty({ description: 'CV file URL', required: false })
  cvUrl?: string;

  @ApiProperty({ description: 'Job category IDs (comma-separated)' })
  category: string;

  @ApiProperty({ description: 'Job location IDs (comma-separated)' })
  location: string;

  @ApiProperty({ description: 'Application date' })
  applicationDate: Date;

  @ApiProperty({ description: 'Application status' })
  status: string;

  @ApiProperty({ description: 'Status note', required: false })
  statusNote?: string | null;

  constructor(partial: Partial<AdminApplicationResponseDto>) {
    Object.assign(this, partial);
  }
}

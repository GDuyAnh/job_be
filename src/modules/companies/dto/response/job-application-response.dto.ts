import { ApiProperty } from '@nestjs/swagger';

export class JobApplicationResponseDto {
  @ApiProperty({ description: 'Application ID' })
  id: number;

  @ApiProperty({ description: 'Job title' })
  jobTitle: string;

  @ApiProperty({ description: 'Job ID' })
  jobId: number;

  @ApiProperty({ description: 'Applicant full name' })
  applicantName: string;

  @ApiProperty({ description: 'Phone number (blank)' })
  phone: string;

  @ApiProperty({ description: 'Applicant email' })
  email: string;

  @ApiProperty({ description: 'CV file URL', required: false })
  cvUrl?: string;

  @ApiProperty({ description: 'Application date' })
  applicationDate: Date;

  constructor(data: Partial<JobApplicationResponseDto>) {
    Object.assign(this, data);
  }
}


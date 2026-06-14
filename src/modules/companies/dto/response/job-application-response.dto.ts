import { ApiProperty } from '@nestjs/swagger';

export class JobApplicationResponseDto {
  @ApiProperty({ description: 'Application ID' })
  id: number;

  @ApiProperty({ description: 'Job title' })
  jobTitle: string;

  @ApiProperty({ description: 'Job ID' })
  jobId: number;

  @ApiProperty({ description: 'Applicant user ID' })
  userId: number;

  @ApiProperty({ description: 'Applicant full name' })
  applicantName: string;

  @ApiProperty({ description: 'Phone number (blank)' })
  phone: string;

  @ApiProperty({ description: 'Applicant email' })
  email: string;

  @ApiProperty({ description: 'CV file URL', required: false })
  cvUrl?: string;

  @ApiProperty({ description: 'Cover letter text', required: false })
  coverLetterText?: string;

  @ApiProperty({ description: 'Application date' })
  applicationDate: Date;

  @ApiProperty({ description: 'Application status' })
  status: string;

  @ApiProperty({ description: 'Status note', required: false })
  statusNote?: string | null;

  constructor(data: Partial<JobApplicationResponseDto>) {
    Object.assign(this, data);
  }
}

// dto/company-job-summary.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Job } from '@/modules/jobs/job.entity';

export class CompanyJobSummaryDto {
  @ApiProperty({ description: 'Job ID' })
  id: number;

  @ApiProperty({ description: 'Job title' })
  title: string;

  @ApiProperty({ description: 'Job location ID' })
  location: number;

  @ApiProperty({ description: 'Type of employment ID' })
  typeOfEmployment: number;

  @ApiProperty({ description: 'Job image logo', nullable: true })
  imageLogo: string | null;

  @ApiProperty({ description: 'Posted date' })
  postedDate: Date;

  constructor(job: Job) {
    this.id = job.id;
    this.title = job.title;
    this.location = job.location;
    this.typeOfEmployment = job.typeOfEmployment;
    this.imageLogo = job.imageLogo;
  }
}

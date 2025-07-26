import { ApiProperty } from '@nestjs/swagger';
import { JobDetail } from '../job-detail.entity';

export class JobDto {
  @ApiProperty({ description: 'Hình thức làm việc' })
  typeOfEmployment: string;

  @ApiProperty({ description: 'Kinh nghiệm yêu cầu' })
  experienceLevel: string;
}

export class JobDetailDto {
  @ApiProperty({ type: () => JobDto })
  job: JobDto;

  @ApiProperty({ type: () => JobDetail, nullable: true })
  detail: JobDetail | null;

  constructor(job: any, detail: JobDetail | null) {
    this.job = {
      typeOfEmployment: job.typeOfEmployment,
      experienceLevel: job.experienceLevel,
    };
    this.detail = detail;
  }
}

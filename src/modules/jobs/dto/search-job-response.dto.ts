import { ApiProperty } from '@nestjs/swagger';

export class JobResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  typeOfEmployment: string;

  @ApiProperty()
  experienceLevel: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  companyLogo: string;

  @ApiProperty()
  salary: string;

  @ApiProperty()
  isFeatured: boolean;

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
  }
}

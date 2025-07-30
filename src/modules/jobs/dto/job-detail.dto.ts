import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';

export class JobDetailDto {
  @ApiProperty({ description: 'Type of employment' })
  @IsString({ message: 'Type of employment must be a string' })
  @IsNotEmpty({ message: 'Type of employment is required' })
  typeOfEmployment: string;

  @ApiProperty({ description: 'Experience level required' })
  @IsString({ message: 'Experience level must be a string' })
  @IsNotEmpty({ message: 'Experience level is required' })
  experienceLevel: string;

  @ApiProperty({
    description: 'Image logo (default if not provided)',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Image logo must be a string' })
  imageLogo: string | null;

  @ApiProperty({
    description: 'Banner logo (default if not provided)',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Banner logo must be a string' })
  bannerLogo: string | null;

  @ApiProperty({ description: 'Posted date' })
  @IsDate({ message: 'Posted date must be a valid date' })
  postedDate: Date;

  @ApiProperty({ description: 'Application deadline', nullable: true })
  @IsOptional()
  @IsDate({ message: 'Deadline must be a valid date' })
  deadline: Date | null;

  @ApiProperty({ description: 'Salary', nullable: true })
  @IsOptional()
  @IsString({ message: 'Salary must be a string' })
  salary: string | null;

  @ApiProperty({ description: 'Benefits', nullable: true })
  @IsOptional()
  @IsString({ message: 'Benefits must be a string' })
  benefits: string | null;

  @ApiProperty({ description: 'Detailed description', nullable: true })
  @IsOptional()
  @IsString({ message: 'Detail description must be a string' })
  detailDescription: string | null;

  constructor(job: any) {
    this.typeOfEmployment = job.typeOfEmployment;
    this.experienceLevel = job.experienceLevel;
    this.imageLogo = job.imageLogo;
    this.bannerLogo = job.bannerLogo;
    this.postedDate = job.postedDate;
    this.deadline = job.deadline;
    this.salary = job.salary;
    this.benefits = job.benefits;
    this.detailDescription = job.detailDescription;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';

export class JobDetailDto {
  @ApiProperty({ description: 'Hình thức làm việc' })
  @IsString({ message: 'Type of employment must be a string' })
  @IsNotEmpty({ message: 'Type of employment is required' })
  typeOfEmployment: string;

  @ApiProperty({ description: 'Kinh nghiệm yêu cầu' })
  @IsString({ message: 'Experience level must be a string' })
  @IsNotEmpty({ message: 'Experience level is required' })
  experienceLevel: string;

  @ApiProperty({
    description: 'Image logo (default nếu không có)',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Image logo must be a string' })
  imageLogo: string | null;

  @ApiProperty({
    description: 'Banner logo (default nếu không có)',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Banner logo must be a string' })
  bannerLogo: string | null;

  @ApiProperty({ description: 'Ngày đăng tin' })
  @IsDate({ message: 'Posted date must be a valid date' })
  postedDate: Date;

  @ApiProperty({ description: 'Hạn cuối ứng tuyển', nullable: true })
  @IsOptional()
  @IsDate({ message: 'Deadline must be a valid date' })
  deadline: Date | null;

  @ApiProperty({ description: 'Mức lương', nullable: true })
  @IsOptional()
  @IsString({ message: 'Salary must be a string' })
  salary: string | null;

  @ApiProperty({ description: 'Phúc lợi', nullable: true })
  @IsOptional()
  @IsString({ message: 'Benefits must be a string' })
  benefits: string | null;

  @ApiProperty({ description: 'Chi tiết công việc', nullable: true })
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

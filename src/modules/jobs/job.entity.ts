import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../companies/company.entity';
import { JobBenefit } from './job-benefit.entity';
import { User } from '../users/user.entity';

@Entity('jobs')
export class Job {
  @ApiProperty({ description: 'Job ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Job title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Job description' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Job category' })
  @Column()
  category: number;

  @ApiProperty({ description: 'Job location' })
  @Column()
  location: number;

  @ApiProperty({ description: 'Type of employment' })
  @Column()
  typeOfEmployment: number;

  @ApiProperty({ description: 'Experience level required' })
  @Column()
  experienceLevel: number;

  @ApiProperty({ description: 'User ID' })
  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.jobs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'Company ID' })
  @Column({ nullable: true })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.jobs)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ApiProperty({ description: 'Created date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Job approval status - true if waiting for admin approval ',
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isWaiting: boolean;

  @ApiProperty({ description: 'Whether the job is featured', default: false })
  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @ApiProperty({ description: 'Image logo (default if not provided)' })
  @Column({ nullable: true })
  imageLogo: string;

  @ApiProperty({ description: 'Banner logo (default if not provided)' })
  @Column({ nullable: true })
  bannerLogo: string;

  @ApiProperty({ description: 'Posted date' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  postedDate: Date;

  @ApiProperty({ description: 'Application deadline' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  deadline: Date;

  @ApiProperty({ description: 'Salary Min' })
  @Column({ nullable: false })
  salaryMin: number;

  @ApiProperty({ description: 'Salary Max' })
  @Column({ nullable: false })
  salaryMax: number;

  @ApiProperty({
    description: 'Salary Type . Example : MONTH , WEEK , NEGOTIABLE ',
  })
  @Column({ nullable: false })
  salaryType: number;

  @ApiProperty({
    description: 'Salary Type Value . Example : 100000 ',
  })
  @Column({ default: 0 })
  salaryTypeValue: number;

  // Internal use only, not exposed directly in API
  jobBenefits?: JobBenefit[];

  @ApiProperty({ description: 'Detailed description' })
  @Column({ type: 'text', nullable: true })
  detailDescription: string;
}

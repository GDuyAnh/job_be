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
  category: string;

  @ApiProperty({ description: 'Job location' })
  @Column()
  location: string;

  @ApiProperty({ description: 'Type of employment' })
  @Column()
  typeOfEmployment: string;

  @ApiProperty({ description: 'Experience level required' })
  @Column()
  experienceLevel: string;

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
  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @ApiProperty({ description: 'Salary' })
  @Column({ nullable: true })
  salary: string;

  @ApiProperty({ description: 'Benefits' })
  @Column({ type: 'text', nullable: true })
  benefits: string;

  @ApiProperty({ description: 'Detailed description' })
  @Column({ type: 'text', nullable: true })
  detailDescription: string;
}

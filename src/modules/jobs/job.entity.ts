import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { JobDetail } from './job-detail.entity';
import { Company } from '../companies/company.entity';

@Entity('jobs')
export class Job {
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'jobDetail' })
  @OneToOne(() => JobDetail, (detail) => detail.job)
  detail: JobDetail;

  @ApiProperty({ description: 'title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'description' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'tagId' })
  @Column()
  tagId: number;

  @ApiProperty({ description: 'category' })
  @Column()
  category: string;

  @ApiProperty({ description: 'location' })
  @Column()
  location: string;

  @ApiProperty({ description: 'typeOfEmployment' })
  @Column()
  typeOfEmployment: string;

  @ApiProperty({ description: 'experienceLevel' })
  @Column()
  experienceLevel: string;

  @ApiProperty({ description: 'companyId' })
  @Column({ nullable: true })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.jobs)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ApiProperty({ description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Công việc nổi bật hay không', default: false })
  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;
}

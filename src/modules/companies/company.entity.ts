import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Job } from '../jobs/job.entity';
import { CompanyImage } from './company-image.entity';

@Entity('companies')
export class Company {
  @ApiProperty({ description: 'Company ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Company name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Company mst' })
  @Column()
  mst: string;

  @ApiProperty({ description: 'Company logo' })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty({
    description: 'Organization type ID (1: Public school, 2: Catholic, etc.)',
    example: 1,
  })
  @Column({ type: 'int', nullable: true })
  organizationType: number;

  @ApiProperty({ description: 'Whether the company is shown', default: false })
  @Column({ type: 'boolean', default: false })
  isShow: boolean;

  @ApiProperty({
    description:
      'Company approval status - true if waiting for admin approval ',
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isWaiting: boolean;

  @ApiProperty({ description: 'Company website' })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({ description: 'Detailed address' })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({ description: 'Company size (e.g., 123 employees)' })
  @Column({ nullable: true })
  companySize: number;

  @ApiProperty({ description: 'Founded year' })
  @Column({ type: 'int', nullable: true })
  foundedYear: number;

  @ApiProperty({ description: 'Company email' })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({ description: 'Company Insight' })
  @Column({ type: 'text', nullable: true })
  insight: string;

  @ApiProperty({ description: 'Company Overview' })
  @Column({ type: 'text', nullable: true })
  overview: string;

  @ApiProperty({ description: 'Company description (rich text)' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Facebook link' })
  @Column({ nullable: true })
  facebookLink: string;

  @ApiProperty({ description: 'Twitter link' })
  @Column({ nullable: true })
  twitterLink: string;

  @ApiProperty({ description: 'LinkedIn link' })
  @Column({ nullable: true })
  linkedInLink: string;

  @ApiProperty({ description: 'Instagram link' })
  @Column({ nullable: true })
  instagramLink: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Job, (job) => job.company)
  jobs: Job[];

  @OneToMany(() => CompanyImage, (image) => image.company, { cascade: true })
  companyImages: CompanyImage[];
}

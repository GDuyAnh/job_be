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

@Entity('companies')
export class Company {
  @ApiProperty({ description: 'Company ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Company name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Company logo' })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty({
    description: 'Organization type (Public school, Catholic, etc.)',
  })
  @Column({ nullable: true })
  organizationType: string;

  @ApiProperty({ description: 'Open positions (number)' })
  @Column({ nullable: true, type: 'int' })
  openPositions: number;

  @ApiProperty({ description: 'Whether the company is shown', default: false })
  @Column({ type: 'boolean', default: false })
  isShow: boolean;

  @ApiProperty({ description: 'Company website' })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({ description: 'Detailed address' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ description: 'Company size (e.g., 50-100 employees)' })
  @Column({ nullable: true })
  companySize: number;

  @ApiProperty({ description: 'Founded year' })
  @Column({ type: 'int', nullable: true })
  foundedYear: number;

  @ApiProperty({ description: 'Company email' })
  @Column({ nullable: true })
  email: string;

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
}

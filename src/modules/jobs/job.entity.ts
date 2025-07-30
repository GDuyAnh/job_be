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
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  
  @ApiProperty({ description: 'title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'description' })
  @Column('text')
  description: string;

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

  @ApiProperty({ description: 'Image logo (default nếu không có)' })
  @Column({ nullable: true })
  imageLogo: string;

  @ApiProperty({ description: 'Banner logo (default nếu không có)' })
  @Column({ nullable: true })
  bannerLogo: string;

  @ApiProperty({ description: 'Ngày đăng tin' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  postedDate: Date;

  @ApiProperty({ description: 'Hạn cuối ứng tuyển' })
  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @ApiProperty({ description: 'Mức lương' })
  @Column({ nullable: true })
  salary: string;

  @ApiProperty({ description: 'Phúc lợi' })
  @Column({ type: 'text', nullable: true })
  benefits: string;

  @ApiProperty({ description: 'description in detail' })
  @Column({ type: 'text', nullable: true })
  detailDescription: string; 
}

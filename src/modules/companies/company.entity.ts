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
  @ApiProperty({ description: 'ID công ty' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên công ty' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Logo công ty' })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty({ description: 'Loại hình tổ chức (Trường công lập, Công giáo, ...)' })
  @Column({ nullable: true })
  organizationType: string;

  @ApiProperty({ description: 'Vị trí đang tuyển (có thể là số lượng hoặc mô tả ngắn)' })
  @Column({ nullable: true })
  openPositions: number;

  @ApiProperty({ description: 'Link mạng xã hội' })
  @Column({ type: 'json', nullable: true })
  socialLinks: string[];

  @ApiProperty({ description: 'Website công ty' })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({ description: 'Tỉnh/thành phố' })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ description: 'Địa chỉ chi tiết' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ description: 'Quy mô công ty (ví dụ: 50-100 nhân sự)' })
  @Column({ nullable: true })
  companySize: string;

  @ApiProperty({ description: 'Năm thành lập' })
  @Column({ type: 'int', nullable: true })
  foundedYear: number;

  @ApiProperty({ description: 'Email công ty' })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({ description: 'Mô tả công ty (rich text)' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Job, (job) => job.company)
  jobs: Job[];
} 
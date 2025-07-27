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
  openPositions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Job, (job) => job.company)
  jobs: Job[];
} 
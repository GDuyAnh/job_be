import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Job } from './job.entity';
import { User } from '../users/user.entity';

@Entity('job_applications')
export class JobApplication {
  @ApiProperty({ description: 'Application ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Job ID' })
  @Column()
  jobId: number;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @ApiProperty({ description: 'User ID (Applicant)' })
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'Resume/CV file path' })
  @Column({ nullable: true })
  resumePath: string;

  @ApiProperty({ description: 'Application date' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt: Date;

  @ApiProperty({ description: 'Created date' })
  @CreateDateColumn()
  createdAt: Date;
}


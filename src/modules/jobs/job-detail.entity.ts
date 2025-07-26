import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Job } from './job.entity';

@Entity('job_details')
export class JobDetail {
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'jobId' })
  @Column()
  jobId: number;

  @OneToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  job: Job;

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

  @ApiProperty({ description: 'Chi tiết công việc' })
  @Column({ type: 'text', nullable: true })
  content: string; 
}

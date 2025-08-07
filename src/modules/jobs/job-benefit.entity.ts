import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('job_benefit')
export class JobBenefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobId: number;

  @Column()
  benefitId: number;
}

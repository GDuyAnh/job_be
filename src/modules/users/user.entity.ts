import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RoleStatus } from '@/enum/role';
import { Job } from '../jobs/job.entity';
import { Company } from '../companies/company.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'username' })
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ApiProperty({ description: 'fullName' })
  @Column()
  fullName: string;

  @ApiProperty({ description: 'phoneNumber', required: false })
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty({ description: 'isActive' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'role',
    enum: RoleStatus,
    default: RoleStatus.USER,
  })
  @Column({
    type: 'enum',
    enum: RoleStatus,
    default: RoleStatus.USER,
  })
  role: RoleStatus;

  @ApiProperty({ description: 'Company ID', required: false })
  @Column({ nullable: true })
  companyId: number;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ApiProperty({ description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Job, (job) => job.user)
  jobs: Job[];
}

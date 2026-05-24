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

  @ApiProperty({
    description: 'Location (province/city) as string number enum',
    required: false,
  })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({
    description:
      'Expertise (categories) as comma-separated string number enum list',
    required: false,
  })
  @Column({ nullable: true })
  expertise: string;

  @ApiProperty({
    description: 'Gender (male/female/both)',
    required: false,
    example: 'both',
  })
  @Column({ nullable: true })
  gender: string;

  @ApiProperty({ description: 'CV URL', required: false })
  @Column({ nullable: true })
  cvUrl: string;

  @ApiProperty({ description: 'CV Original Filename', required: false })
  @Column({ nullable: true })
  cvFileName: string;

  @ApiProperty({ description: 'Cover Letter URL', required: false })
  @Column({ nullable: true })
  coverLetterUrl: string;

  @ApiProperty({ description: 'Cover Letter Original Filename', required: false })
  @Column({ nullable: true })
  coverLetterFileName: string;

  @ApiProperty({ description: 'Cover Letter Text', required: false })
  @Column({ type: 'text', nullable: true })
  coverLetterText: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @Column({ nullable: true })
  avatarUrl: string;

  @ApiProperty({ description: 'Avatar Original Filename', required: false })
  @Column({ nullable: true })
  avatarFileName: string;

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

  @ApiProperty({
    description: 'True if this user is the host of the company (only one per company)',
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isHostCompany: boolean;

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

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';

@Entity('company_details')
export class CompanyDetail {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'companyId' })
  @Column()
  companyId: number;

  @OneToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

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
} 
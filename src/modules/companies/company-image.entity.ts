import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from './company.entity';

@Entity('company_image')
export class CompanyImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Company, (company) => company.companyImages, {
    onDelete: 'CASCADE',
  })
  company: Company;
}

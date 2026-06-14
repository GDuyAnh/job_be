import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('email_templates')
export class EmailTemplate {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Fixed template code, e.g. JOB_APPROVED' })
  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @ApiProperty({ description: 'Display name for admin UI' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'When this email is sent' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Email subject with {{placeholders}}' })
  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @ApiProperty({ description: 'HTML body from rich editor' })
  @Column({ type: 'longtext' })
  htmlBody: string;

  @ApiProperty({ description: 'Suggested variables for admin UI' })
  @Column({ type: 'json', nullable: true })
  variables: string[] | null;

  @ApiProperty({ description: 'When false, sending is skipped' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}

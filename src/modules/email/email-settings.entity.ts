import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('email_settings')
export class EmailSettings {
  @ApiProperty({ description: 'Singleton row id (always 1)' })
  @PrimaryColumn({ type: 'int' })
  id: number;

  @ApiProperty({ description: 'SMTP host' })
  @Column({ type: 'varchar', length: 255 })
  smtpHost: string;

  @ApiProperty({ description: 'SMTP port' })
  @Column({ type: 'int' })
  smtpPort: number;

  @ApiProperty({ description: 'Use SSL (port 465)' })
  @Column({ type: 'boolean', default: false })
  smtpSecure: boolean;

  @ApiProperty({ description: 'SMTP username / login email' })
  @Column({ type: 'varchar', length: 255 })
  smtpUser: string;

  @Column({ type: 'varchar', length: 512 })
  smtpPass: string;

  @ApiProperty({ description: 'Sender display name' })
  @Column({ type: 'varchar', length: 255 })
  fromName: string;

  @ApiProperty({ description: 'Sender email address' })
  @Column({ type: 'varchar', length: 255 })
  fromEmail: string;

  @UpdateDateColumn()
  updatedAt: Date;
}

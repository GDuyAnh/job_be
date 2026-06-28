import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('contact_messages')
export class ContactMessage {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 200 })
  fullName: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ApiProperty({ description: 'Mã chủ đề: candidate_support, employer_support, ...' })
  @Column({ type: 'varchar', length: 64 })
  subject: string;

  @ApiProperty()
  @Column({ type: 'text' })
  message: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}

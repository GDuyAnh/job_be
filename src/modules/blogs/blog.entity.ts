import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('blogs')
export class Blog {
  @ApiProperty({ description: 'Blog ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Blog title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Blog description' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Blog image URL' })
  @Column()
  image: string;

  @ApiProperty({ description: 'Blog URL slug' })
  @Column()
  url: string;

  @ApiProperty({ description: 'Blog author' })
  @Column({ nullable: true })
  author: string;

  @ApiProperty({ description: 'Blog status', default: 'published' })
  @Column({ default: 'published' })
  status: string;

  @ApiProperty({ description: 'Created date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  @UpdateDateColumn()
  updatedAt: Date;
} 
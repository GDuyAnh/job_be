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

  @ApiProperty({ description: 'Blog content (rich text)' })
  @Column('text', { nullable: true })
  content: string;

  @ApiProperty({ description: 'Blog description' })
  @Column('text', { nullable: true })
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

  @ApiProperty({ description: 'SEO Title' })
  @Column({ nullable: true })
  titleSeo: string;

  @ApiProperty({ description: 'Meta description (max 1000 chars)' })
  @Column({ length: 1000, nullable: true })
  metaDescription: string;

  @ApiProperty({ description: 'Schema JSON (optional, max 1000 chars)', required: false })
  @Column({ length: 1000, nullable: true })
  schema?: string;

  @ApiProperty({ description: 'Blog category' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Display on homepage', required: false, default: false })
  @Column({ default: false })
  displayOnHomepage: boolean;

  @ApiProperty({ description: 'Created date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  @UpdateDateColumn()
  updatedAt: Date;
}

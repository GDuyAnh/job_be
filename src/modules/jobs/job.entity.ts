import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('jobs')
export class Job {
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'description' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'tagId' })
  @Column()
  tagId: number;

  @ApiProperty({ description: 'category' })
  @Column()
  category: string;

  @ApiProperty({ description: 'location' })
  @Column()
  location: string;

  @ApiProperty({ description: 'typeOfEmployment' })
  @Column()
  typeOfEmployment: string;

  @ApiProperty({ description: 'experienceLevel' })
  @Column()
  experienceLevel: string;

  @ApiProperty({ description: 'createdAt' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ description: 'title', example: 'Backend Developer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'description', example: 'Develop backend services...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'tagId', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  tagId: number;
} 
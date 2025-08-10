import { ApiProperty } from '@nestjs/swagger';

export class CategoryStatsDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Literature Teacher'
  })
  category: number;

  @ApiProperty({
    description: 'Number of jobs in this category',
    example: 10
  })
  jobCount: number;

  constructor(category: number, jobCount: number) {
    this.category = category;
    this.jobCount = jobCount;
  }
} 
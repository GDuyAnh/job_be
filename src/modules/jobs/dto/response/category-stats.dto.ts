import { ApiProperty } from '@nestjs/swagger';

export class CategoryStatsDto {
  @ApiProperty({
    description: 'Category as comma-separated string (e.g., "1,2,3")',
    example: '1,2'
  })
  category: string;

  @ApiProperty({
    description: 'Number of jobs in this category',
    example: 10
  })
  jobCount: number;

  constructor(category: string, jobCount: number) {
    this.category = category;
    this.jobCount = jobCount;
  }
} 
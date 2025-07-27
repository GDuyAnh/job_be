import { ApiProperty } from '@nestjs/swagger';

export class CategoryStatsDto {
  @ApiProperty({
    description: 'Tên category',
    example: 'Giáo viên ngữ văn'
  })
  category: string;

  @ApiProperty({
    description: 'Số lượng jobs thuộc category',
    example: 10
  })
  jobCount: number;

  constructor(category: string, jobCount: number) {
    this.category = category;
    this.jobCount = jobCount;
  }
} 
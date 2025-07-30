import { ApiProperty } from '@nestjs/swagger';

export class LocationStatsDto {
  @ApiProperty({
    description: 'Tên location',
    example: 'HaNoi'
  })
  location: string;

  @ApiProperty({
    description: 'Số lượng jobs thuộc location',
    example: 15
  })
  jobCount: number;

  @ApiProperty({
    description: 'Có phải là tỉnh thành lớn hay không',
    example: true
  })
  isMajorCity: boolean;

  constructor(location: string, jobCount: number, isMajorCity: boolean) {
    this.location = location;
    this.jobCount = jobCount;
    this.isMajorCity = isMajorCity;
  }
} 
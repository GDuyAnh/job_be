import { ApiProperty } from '@nestjs/swagger';

export class LocationStatsDto {
  @ApiProperty({
    description: 'Location name',
    example: 'HaNoi'
  })
  location: string;

  @ApiProperty({
    description: 'Number of jobs in this location',
    example: 15
  })
  jobCount: number;

  @ApiProperty({
    description: 'Whether this is a major city',
    example: true
  })
  isMajorCity: boolean;

  constructor(location: string, jobCount: number, isMajorCity: boolean) {
    this.location = location;
    this.jobCount = jobCount;
    this.isMajorCity = isMajorCity;
  }
} 
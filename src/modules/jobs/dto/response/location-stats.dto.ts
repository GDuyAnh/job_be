import { ApiProperty } from '@nestjs/swagger';

export class LocationStatsDto {
  @ApiProperty({
    description: 'Location ID',
    example: 1,
  })
  location: number;

  @ApiProperty({
    description: 'Number of jobs in this location',
    example: 15,
  })
  jobCount: number;

  @ApiProperty({
    description: 'Whether this is a major city',
    example: true,
  })
  isMajorCity: boolean;

  @ApiProperty({
    description: 'Image URL representing this location',
    example:
      'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-thumb.jpg',
    required: false,
    nullable: true,
  })
  image?: string | null;

  constructor(data: Partial<LocationStatsDto>) {
    this.location = data.location;
    this.jobCount = data.jobCount;
    this.isMajorCity = data.isMajorCity ?? false;
    this.image = data.image ?? null;
  }
}

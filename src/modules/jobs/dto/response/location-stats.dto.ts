import { ApiProperty } from '@nestjs/swagger';

export class LocationStatsDto {
  @ApiProperty({
    description: 'Location name',
    example: 'HaNoi',
  })
  location: string;

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
  })
  image?: string;

  constructor(
    location: string,
    jobCount: number,
    isMajorCity: boolean,
    image?: string,
  ) {
    this.location = location;
    this.jobCount = jobCount;
    this.isMajorCity = isMajorCity;
    this.image = image;
  }
}

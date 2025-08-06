import { ApiProperty } from '@nestjs/swagger';

export class BlogDtoResponse {
  @ApiProperty({ description: 'Blog ID' })
  id: number;

  @ApiProperty({ description: 'Blog title' })
  title: string;

  @ApiProperty({ description: 'Blog description' })
  description: string;

  @ApiProperty({ description: 'Blog image URL' })
  image: string;

  @ApiProperty({ description: 'Blog URL slug' })
  url: string;

  @ApiProperty({ description: 'Blog author' })
  author: string;

  @ApiProperty({ description: 'Blog status' })
  status: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

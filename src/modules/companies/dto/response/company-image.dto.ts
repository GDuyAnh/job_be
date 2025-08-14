import { ApiProperty } from '@nestjs/swagger';

export class CompanyImageDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;
}

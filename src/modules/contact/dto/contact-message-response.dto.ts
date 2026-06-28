import { ApiProperty } from '@nestjs/swagger';

export class ContactMessageResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Đã gửi tin nhắn thành công' })
  message: string;
}

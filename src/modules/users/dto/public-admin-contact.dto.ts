import { ApiProperty } from '@nestjs/swagger';

export class PublicAdminContactDto {
  @ApiProperty({ description: 'Họ tên admin liên hệ' })
  fullName: string;

  @ApiProperty({ description: 'Email admin' })
  email: string;

  @ApiProperty({ description: 'Số điện thoại admin', nullable: true })
  phoneNumber: string | null;
}

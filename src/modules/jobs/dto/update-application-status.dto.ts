import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  APPLICATION_STATUS_VALUES,
  ApplicationStatus,
} from '@/enum/application-status';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.REVIEWING,
  })
  @IsIn(APPLICATION_STATUS_VALUES, {
    message: 'Trạng thái hồ sơ không hợp lệ',
  })
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Ghi chú gửi kèm email cho ứng viên',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  statusMessage?: string;
}

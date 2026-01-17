import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountDto {
  @ApiProperty({ description: 'Current password for confirmation' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetApplicationsDto {
  @ApiPropertyOptional({ description: 'UserId (number ID)' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber({}, { message: 'UserId must be a number' })
  userId?: number;
}


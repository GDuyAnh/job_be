import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'username', example: 'username123' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'email', example: 'gduyanh69@gmail.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

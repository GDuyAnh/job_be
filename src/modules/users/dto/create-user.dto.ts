import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'email', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'username', example: 'username123' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'fullName', example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;
}

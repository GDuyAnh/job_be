import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { RoleStatus } from '@/enum/role';

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

  @ApiProperty({
    description: 'phoneNumber',
    required: false,
    example: '0123456789',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'role - 1: User, 3: Company',
    required: false,
    example: 1,
    enum: [1, 3],
  })
  @IsNumber()
  @IsOptional()
  role?: number;

  @ApiProperty({
    description: 'taxCode - Mã số thuế (bắt buộc khi đăng ký làm nhà tuyển dụng)',
    required: false,
    example: '0123456789',
  })
  @IsString()
  @IsOptional()
  taxCode?: string;

  @ApiProperty({
    description: 'companyId - ID của công ty (FE đã tạo company trước)',
    required: false,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  companyId?: number;
}

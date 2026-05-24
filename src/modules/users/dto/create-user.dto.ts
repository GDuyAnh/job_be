import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ description: 'email', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ description: 'username', example: 'username123' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({ description: 'password', example: 'password123' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ description: 'fullName', example: 'Nguyen Van A' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @ApiProperty({
    description: 'phoneNumber',
    required: false,
    example: '0123456789',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'role - 1: User, 3: Company',
    required: false,
    example: 1,
    enum: [1, 3],
  })
  @IsNumber({}, { message: 'Vai trò phải là số' })
  @IsOptional()
  role?: number;

  @ApiProperty({
    description: 'taxCode - Mã số thuế (bắt buộc khi đăng ký làm nhà tuyển dụng)',
    required: false,
    example: '0123456789',
  })
  @IsString({ message: 'Mã số thuế phải là chuỗi' })
  @IsOptional()
  taxCode?: string;

  @ApiProperty({
    description: 'companyId - ID của công ty (FE đã tạo company trước)',
    required: false,
    example: 1,
  })
  @IsNumber({}, { message: 'Mã công ty phải là số' })
  @IsOptional()
  companyId?: number;
}

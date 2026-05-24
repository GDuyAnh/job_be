import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  newPassword: string;

  @ApiProperty({ description: 'Confirm new password' })
  @IsString({ message: 'Xác nhận mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  confirmPassword: string;
}

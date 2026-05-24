import { IsString, IsNotEmpty, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'Full name' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
  fullName: string;

  @ApiProperty({ description: 'Username' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  username: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Location (province/city) as string number enum',
    required: false,
  })
  @IsString({ message: 'Địa điểm phải là chuỗi' })
  @IsOptional()
  location?: string;

  @ApiProperty({
    description:
      'Expertise (categories) as comma-separated string number enum list',
    required: false,
  })
  @IsString({ message: 'Chuyên môn phải là chuỗi' })
  @IsOptional()
  expertise?: string;

  @ApiProperty({
    description: 'Gender (male/female/both)',
    required: false,
    enum: ['male', 'female', 'both'],
  })
  @IsString({ message: 'Giới tính phải là chuỗi' })
  @IsOptional()
  @IsIn(['male', 'female', 'both'], {
    message: 'Giới tính phải là nam, nữ hoặc cả hai',
  })
  gender?: string;

  @ApiProperty({ description: 'CV URL', required: false })
  @IsString({ message: 'URL CV phải là chuỗi' })
  @IsOptional()
  cvUrl?: string;

  @ApiProperty({ description: 'CV Original Filename', required: false })
  @IsString({ message: 'Tên tệp CV phải là chuỗi' })
  @IsOptional()
  cvFileName?: string;

  @ApiProperty({ description: 'Cover Letter URL', required: false })
  @IsString({ message: 'URL thư xin việc phải là chuỗi' })
  @IsOptional()
  coverLetterUrl?: string;

  @ApiProperty({ description: 'Cover Letter Original Filename', required: false })
  @IsString({ message: 'Tên tệp thư xin việc phải là chuỗi' })
  @IsOptional()
  coverLetterFileName?: string;

  @ApiProperty({ description: 'Cover Letter Text', required: false })
  @IsString({ message: 'Nội dung thư xin việc phải là chuỗi' })
  @IsOptional()
  coverLetterText?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsString({ message: 'URL ảnh đại diện phải là chuỗi' })
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: 'Avatar Original Filename', required: false })
  @IsString({ message: 'Tên tệp ảnh đại diện phải là chuỗi' })
  @IsOptional()
  avatarFileName?: string;
}

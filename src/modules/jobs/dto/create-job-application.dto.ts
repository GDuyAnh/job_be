import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobApplicationDto {
  @ApiProperty({ description: 'Job ID' })
  @IsInt({ message: 'Mã việc làm phải là số nguyên' })
  @IsNotEmpty({ message: 'Mã việc làm không được để trống' })
  jobId: number;

  @ApiProperty({
    description:
      'User ID (optional - will be found or created if not provided)',
    required: false,
  })
  @IsInt({ message: 'Mã người dùng phải là số nguyên' })
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: 'Full Name' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @ApiProperty({ description: 'Phone Number' })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ description: 'CV URL', required: false })
  @IsString({ message: 'URL CV phải là chuỗi' })
  @IsOptional()
  cvUrl?: string;

  @ApiProperty({ description: 'Cover Letter Text', required: false })
  @IsString({ message: 'Thư xin việc phải là chuỗi' })
  @IsOptional()
  coverLetter?: string;

  @ApiProperty({ description: 'Cover Letter URL', required: false })
  @IsString({ message: 'URL thư xin việc phải là chuỗi' })
  @IsOptional()
  coverLetterUrl?: string;
}

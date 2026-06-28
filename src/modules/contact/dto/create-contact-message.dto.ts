import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { CONTACT_SUBJECT_CODES } from '../contact.constants';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @MaxLength(200, { message: 'Họ và tên tối đa 200 ký tự' })
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(255, { message: 'Email tối đa 255 ký tự' })
  email: string;

  @ApiProperty({
    enum: CONTACT_SUBJECT_CODES,
    example: 'candidate_support',
  })
  @IsIn(CONTACT_SUBJECT_CODES, { message: 'Chủ đề không hợp lệ' })
  subject: string;

  @ApiProperty({ example: 'Nội dung tin nhắn...' })
  @IsString({ message: 'Nội dung phải là chuỗi' })
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @MaxLength(1000, { message: 'Nội dung tối đa 1000 ký tự' })
  message: string;
}

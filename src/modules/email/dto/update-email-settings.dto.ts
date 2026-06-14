import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateEmailSettingsDto {
  @ApiProperty({ example: 'smtp.gmail.com' })
  @IsNotEmpty()
  @IsString()
  smtpHost: string;

  @ApiProperty({ example: 587 })
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @ApiProperty({ example: 'noreply@example.com' })
  @IsNotEmpty()
  @IsString()
  smtpUser: string;

  @ApiProperty({ example: 'app-password-or-smtp-password' })
  @IsNotEmpty()
  @IsString()
  smtpPass: string;

  @ApiProperty({ example: 'TopViec' })
  @IsNotEmpty()
  @IsString()
  fromName: string;
}

export class TestEmailSettingsDto {
  @ApiProperty({
    required: false,
    description: 'Recipient email (defaults to current admin email)',
  })
  @IsOptional()
  @IsEmail()
  to?: string;
}

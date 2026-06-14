import { ApiProperty } from '@nestjs/swagger';
import { EmailSettings } from '../email-settings.entity';

export class EmailSettingsResponseDto {
  @ApiProperty()
  smtpHost: string;

  @ApiProperty()
  smtpPort: number;

  @ApiProperty()
  smtpSecure: boolean;

  @ApiProperty()
  smtpUser: string;

  @ApiProperty({ description: 'Whether SMTP password is configured' })
  smtpPassConfigured: boolean;

  @ApiProperty({
    required: false,
    description: 'SMTP password (admin settings form only)',
  })
  smtpPass?: string;

  @ApiProperty()
  fromName: string;

  @ApiProperty()
  fromEmail: string;

  @ApiProperty({ description: 'true when settings are stored in database' })
  isStoredInDatabase: boolean;

  @ApiProperty({ required: false })
  updatedAt?: Date | null;

  constructor(
    data: {
      smtpHost: string;
      smtpPort: number;
      smtpSecure: boolean;
      smtpUser: string;
      smtpPassConfigured: boolean;
      smtpPass?: string;
      fromName: string;
      fromEmail: string;
      isStoredInDatabase: boolean;
      updatedAt?: Date | null;
    },
  ) {
    this.smtpHost = data.smtpHost;
    this.smtpPort = data.smtpPort;
    this.smtpSecure = data.smtpSecure;
    this.smtpUser = data.smtpUser;
    this.smtpPassConfigured = data.smtpPassConfigured;
    this.smtpPass = data.smtpPass ?? '';
    this.fromName = data.fromName;
    this.fromEmail = data.fromEmail;
    this.isStoredInDatabase = data.isStoredInDatabase;
    this.updatedAt = data.updatedAt ?? null;
  }

  static fromEntity(entity: EmailSettings): EmailSettingsResponseDto {
    return new EmailSettingsResponseDto({
      smtpHost: entity.smtpHost,
      smtpPort: entity.smtpPort,
      smtpSecure: entity.smtpSecure,
      smtpUser: entity.smtpUser,
      smtpPassConfigured: !!entity.smtpPass?.trim(),
      smtpPass: entity.smtpPass || '',
      fromName: entity.fromName,
      fromEmail: entity.fromEmail,
      isStoredInDatabase: true,
      updatedAt: entity.updatedAt,
    });
  }
}

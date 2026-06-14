import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSettings } from './email-settings.entity';
import { EmailSettingsResponseDto } from './dto/email-settings-response.dto';
import {
  TestEmailSettingsDto,
  UpdateEmailSettingsDto,
} from './dto/update-email-settings.dto';

export const EMAIL_SETTINGS_SINGLETON_ID = 1;

export interface ResolvedEmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    email: string;
  };
  frontendUrl: string;
  source: 'database';
}

@Injectable()
export class EmailSettingsService {
  constructor(
    @InjectRepository(EmailSettings)
    private readonly emailSettingsRepository: Repository<EmailSettings>,
    private readonly configService: ConfigService,
  ) {}

  private async getFirstStoredSettings(): Promise<EmailSettings | null> {
    const rows = await this.emailSettingsRepository.find({
      order: { id: 'ASC' },
      take: 1,
    });

    return rows[0] ?? null;
  }

  private getEmptyAdminSettings(): EmailSettingsResponseDto {
    return new EmailSettingsResponseDto({
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: '',
      smtpPassConfigured: false,
      smtpPass: '',
      fromName: '',
      fromEmail: '',
      isStoredInDatabase: false,
      updatedAt: null,
    });
  }

  async getAdminSettings(): Promise<EmailSettingsResponseDto> {
    const stored = await this.getFirstStoredSettings();

    if (!stored) {
      return this.getEmptyAdminSettings();
    }

    return EmailSettingsResponseDto.fromEntity(stored);
  }

  async updateAdminSettings(
    dto: UpdateEmailSettingsDto,
  ): Promise<EmailSettingsResponseDto> {
    const existing = await this.getFirstStoredSettings();
    const nextPass = dto.smtpPass?.trim();

    if (!nextPass) {
      throw new BadRequestException('Mật khẩu SMTP là bắt buộc');
    }

    const smtpUser = dto.smtpUser.trim();

    const payload: EmailSettings = {
      id: existing?.id ?? EMAIL_SETTINGS_SINGLETON_ID,
      smtpHost: dto.smtpHost.trim(),
      smtpPort: dto.smtpPort,
      smtpSecure: dto.smtpSecure === true,
      smtpUser,
      smtpPass: nextPass,
      fromName: dto.fromName.trim(),
      fromEmail: smtpUser,
      updatedAt: new Date(),
    };

    const saved = await this.emailSettingsRepository.save(payload);

    return EmailSettingsResponseDto.fromEntity(saved);
  }

  async resolveActiveConfig(): Promise<ResolvedEmailConfig | null> {
    const stored = await this.getFirstStoredSettings();

    const emailConfig = this.configService.get('email');
    const frontendUrl =
      emailConfig?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3001';

    if (!stored?.smtpUser?.trim() || !stored?.smtpPass?.trim()) {
      return null;
    }

    return {
      smtp: {
        host: stored.smtpHost,
        port: stored.smtpPort,
        secure: stored.smtpSecure,
        auth: {
          user: stored.smtpUser,
          pass: stored.smtpPass,
        },
      },
      from: {
        name: stored.fromName,
        email: stored.fromEmail || stored.smtpUser,
      },
      frontendUrl,
      source: 'database',
    };
  }

  buildTestEmailPayload(to: string) {
    return {
      to,
      subject: 'Kiểm tra cấu hình email - TopViec',
      html: `
        <p>Xin chào,</p>
        <p>Đây là email kiểm tra cấu hình SMTP từ trang quản trị TopViec.</p>
        <p>Nếu bạn nhận được email này, cấu hình gửi mail đang hoạt động.</p>
        <p>Thời gian gửi: ${new Date().toLocaleString('vi-VN')}</p>
      `,
    };
  }

  validateTestDto(dto: TestEmailSettingsDto) {
    return dto;
  }
}

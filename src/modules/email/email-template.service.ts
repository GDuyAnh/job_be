import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './email-template.entity';
import {
  DEFAULT_EMAIL_TEMPLATES,
  getDefaultTemplate,
} from './defaults/templates';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplateService implements OnModuleInit {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  async seedDefaults(): Promise<void> {
    for (const def of DEFAULT_EMAIL_TEMPLATES) {
      const existing = await this.templateRepository.findOne({
        where: { code: def.code },
      });
      if (existing) {
        continue;
      }

      await this.templateRepository.save(
        this.templateRepository.create({
          code: def.code,
          name: def.name,
          description: def.description,
          subject: def.subject,
          htmlBody: def.htmlBody,
          variables: def.variables,
          isActive: def.isActive !== false,
        }),
      );
      this.logger.log(`Seeded email template: ${def.code}`);
    }

    await this.syncPipelineTemplateActivation();
  }

  /** Bật APPLICATION_STATUS_UPDATE nếu DB còn bản seed cũ (inactive). */
  private async syncPipelineTemplateActivation(): Promise<void> {
    const code = 'APPLICATION_STATUS_UPDATE';
    const def = getDefaultTemplate(code);
    if (!def?.isActive) {
      return;
    }

    const existing = await this.templateRepository.findOne({
      where: { code },
    });
    if (!existing || existing.isActive) {
      return;
    }

    if (!existing.description?.includes('Chưa kích hoạt')) {
      return;
    }

    existing.isActive = true;
    existing.description = def.description;
    await this.templateRepository.save(existing);
    this.logger.log(`Activated email template after pipeline rollout: ${code}`);
  }

  async findAll(): Promise<EmailTemplate[]> {
    return this.templateRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findByCode(code: string): Promise<EmailTemplate> {
    const template = await this.templateRepository.findOne({
      where: { code },
    });
    if (!template) {
      throw new NotFoundException(`Không tìm thấy mẫu email: ${code}`);
    }
    return template;
  }

  async update(
    code: string,
    dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const template = await this.findByCode(code);

    if (dto.subject !== undefined) {
      template.subject = dto.subject.trim();
    }
    if (dto.htmlBody !== undefined) {
      template.htmlBody = dto.htmlBody;
    }
    if (dto.isActive !== undefined) {
      template.isActive = dto.isActive;
    }

    return this.templateRepository.save(template);
  }

  async resetToDefault(code: string): Promise<EmailTemplate> {
    const def = getDefaultTemplate(code);
    if (!def) {
      throw new NotFoundException(`Không có mặc định cho mẫu: ${code}`);
    }

    const template = await this.findByCode(code);
    template.name = def.name;
    template.description = def.description;
    template.subject = def.subject;
    template.htmlBody = def.htmlBody;
    template.variables = def.variables;
    template.isActive = def.isActive !== false;

    return this.templateRepository.save(template);
  }

  render(
    code: string,
    template: EmailTemplate,
    variables: Record<string, string | number | undefined | null> = {},
  ): { subject: string; html: string } {
    const merged = {
      year: String(new Date().getFullYear()),
      siteName: 'TopViec',
      ...variables,
    };

    const subject = this.interpolate(template.subject, merged, true);
    const html = this.interpolate(template.htmlBody, merged, true);

    return { subject, html };
  }

  getSampleVariables(code: string): Record<string, string> {
    const template = getDefaultTemplate(code);
    const samples: Record<string, string> = {
      siteName: 'TopViec',
      year: String(new Date().getFullYear()),
      sentAt: new Date().toLocaleString('vi-VN'),
      fullName: 'Nguyễn Văn A',
      email: 'user@example.com',
      username: 'user',
      password: 'user123',
      loginUrl: 'https://example.com/auth/login',
      dashboardUrl: 'https://example.com/companies/dashboard',
      adminDashboardUrl: 'https://example.com/admin/dashboard',
      jobTitle: 'Giáo viên Tiếng Anh',
      companyName: 'ABC School',
      companyMst: '0123456789',
      applicantName: 'Trần Thị B',
      applicantEmail: 'candidate@example.com',
      applicationDate: new Date().toLocaleDateString('vi-VN'),
      jobUrl: 'https://example.com/jobs/1',
      resetUrl: 'https://example.com/auth/reset-password?token=sample',
      verifyUrl: 'https://example.com/auth/verify-email?token=sample',
      expiresAt: new Date(Date.now() + 3600000).toLocaleString('vi-VN'),
      changedAt: new Date().toLocaleString('vi-VN'),
      deadline: new Date(Date.now() + 86400000 * 3).toLocaleDateString(
        'vi-VN',
      ),
      daysLeft: '3',
      rejectReason: 'Thông tin công ty chưa đầy đủ.',
      applicationStatus: 'Đang xem xét',
      statusMessage: 'Nhà tuyển dụng đang xem xét hồ sơ của bạn.',
    };

    if (template?.variables) {
      const result: Record<string, string> = {};
      for (const key of template.variables) {
        result[key] = samples[key] ?? `[${key}]`;
      }
      return result;
    }

    return samples;
  }

  private interpolate(
    text: string,
    variables: Record<string, string | number | undefined | null>,
    escapeHtmlValues: boolean,
  ): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const raw = variables[key];
      const value = raw === undefined || raw === null ? '' : String(raw);
      return escapeHtmlValues ? this.escapeHtml(value) : value;
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailSettingsService, ResolvedEmailConfig } from './email-settings.service';
import { EmailTemplateService } from './email-template.service';

export interface SendByTemplateOptions {
  throwOnError?: boolean;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private activeConfig: ResolvedEmailConfig | null = null;
  private isConfigured = false;

  constructor(
    private readonly emailSettingsService: EmailSettingsService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async onModuleInit() {
    await this.reinitializeTransporter();
  }

  async reinitializeTransporter() {
    this.activeConfig = await this.emailSettingsService.resolveActiveConfig();

    if (!this.activeConfig?.smtp?.auth?.user || !this.activeConfig?.smtp?.auth?.pass) {
      this.transporter = null;
      this.isConfigured = false;
      this.logger.warn(
        'Email service is not configured. Configure SMTP in Admin Settings or .env file.',
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.activeConfig.smtp.host,
        port: this.activeConfig.smtp.port,
        secure: this.activeConfig.smtp.secure,
        auth: {
          user: this.activeConfig.smtp.auth.user,
          pass: this.activeConfig.smtp.auth.pass,
        },
      });

      this.isConfigured = true;
      this.logger.log('Email service initialized successfully');
      this.logger.log(
        `SMTP source: ${this.activeConfig.source}, host: ${this.activeConfig.smtp.host}:${this.activeConfig.smtp.port}`,
      );
    } catch (error) {
      this.transporter = null;
      this.isConfigured = false;
      this.logger.error('Failed to initialize email transporter:', error);
    }
  }

  getActiveConfig() {
    return this.activeConfig;
  }

  getSiteName(): string {
    return this.activeConfig?.from.name || 'TopViec';
  }

  getFrontendUrl(): string {
    return this.activeConfig?.frontendUrl || 'http://localhost:3001';
  }

  buildCommonVariables(): Record<string, string> {
    const frontendUrl = this.getFrontendUrl();
    const siteName = this.getSiteName();
    return {
      siteName,
      year: String(new Date().getFullYear()),
      loginUrl: `${frontendUrl}/auth/login`,
      dashboardUrl: `${frontendUrl}/companies/dashboard`,
      adminDashboardUrl: `${frontendUrl}/admin/dashboard`,
    };
  }

  async sendByTemplate(
    code: string,
    to: string,
    variables: Record<string, string | number | undefined | null> = {},
    options: SendByTemplateOptions = {},
  ): Promise<void> {
    const { throwOnError = false } = options;

    if (!this.isConfigured || !this.transporter || !this.activeConfig) {
      const msg = `Cannot send email (${code}) to ${to}: Email service is not configured.`;
      this.logger.warn(msg);
      if (throwOnError) {
        throw new Error(
          'Email service is not configured. Please save valid SMTP settings first.',
        );
      }
      return;
    }

    try {
      const template = await this.emailTemplateService.findByCode(code);

      if (!template.isActive) {
        this.logger.warn(
          `Email template ${code} is inactive — skipping send to ${to}`,
        );
        return;
      }

      const mergedVariables = {
        ...this.buildCommonVariables(),
        ...variables,
      };

      const { subject, html } = this.emailTemplateService.render(
        code,
        template,
        mergedVariables,
      );

      const fromEmail =
        this.activeConfig.from.email || this.activeConfig.smtp.auth.user;
      const fromName = this.activeConfig.from.name || 'TopViec';

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email [${code}] sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email [${code}] to ${to}:`, error);
      if (throwOnError) {
        throw error;
      }
    }
  }

  async sendToManyByTemplate(
    code: string,
    recipients: string[],
    variables: Record<string, string | number | undefined | null> = {},
  ): Promise<void> {
    const unique = [...new Set(recipients.map((e) => e?.trim()).filter(Boolean))];
    await Promise.all(
      unique.map((to) => this.sendByTemplate(code, to, variables)),
    );
  }

  async sendTestEmail(to: string): Promise<void> {
    await this.sendByTemplate(
      'SMTP_TEST',
      to,
      {
        sentAt: new Date().toLocaleString('vi-VN'),
      },
      { throwOnError: true },
    );
  }

  async sendAccountCredentials(
    email: string,
    fullName: string,
    username: string,
    password: string,
    role: 'candidate' | 'employer' = 'candidate',
  ): Promise<void> {
    const code =
      role === 'employer'
        ? 'ACCOUNT_CREDENTIALS_EMPLOYER'
        : 'ACCOUNT_CREDENTIALS_CANDIDATE';

    await this.sendByTemplate(code, email, {
      fullName,
      email,
      username,
      password,
    });
  }
}

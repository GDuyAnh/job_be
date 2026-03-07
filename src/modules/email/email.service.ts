import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isConfigured = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = this.configService.get('email');
    
    if (!emailConfig?.smtp?.auth?.user || !emailConfig?.smtp?.auth?.pass) {
      this.logger.warn(
        'Email service is not configured. SMTP_USER and SMTP_PASS are required in .env file.',
      );
      this.logger.warn('Email sending will be disabled until SMTP credentials are provided.');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        secure: emailConfig.smtp.secure,
        auth: {
          user: emailConfig.smtp.auth.user,
          pass: emailConfig.smtp.auth.pass,
        },
      });

      this.isConfigured = true;
      this.logger.log('Email service initialized successfully');
      this.logger.log(`SMTP Host: ${emailConfig.smtp.host}:${emailConfig.smtp.port}`);
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  async sendAccountCredentials(
    email: string,
    fullName: string,
    username: string,
    password: string,
  ): Promise<void> {
    if (!this.isConfigured || !this.transporter) {
      this.logger.warn(
        `Cannot send email to ${email}: Email service is not configured. Please check SMTP settings in .env file.`,
      );
      return;
    }

    try {
      const emailConfig = this.configService.get('email');
      const frontendUrl = emailConfig?.frontendUrl || 'http://localhost:3001';
      const fromName = emailConfig?.from?.name || 'TopViec';
      const fromEmail = emailConfig?.from?.email || emailConfig?.smtp?.auth?.user;

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Thông tin tài khoản của bạn - TopViec',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #3b82f6;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .credentials {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #3b82f6;
              }
              .credential-item {
                margin: 15px 0;
              }
              .label {
                font-weight: bold;
                color: #6b7280;
                display: inline-block;
                width: 120px;
              }
              .value {
                color: #111827;
                font-family: monospace;
                background-color: #f3f4f6;
                padding: 5px 10px;
                border-radius: 4px;
              }
              .warning {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Chào mừng đến với Jobters!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${fullName}</strong>,</p>
              
              <p>Tài khoản của bạn đã được tạo thành công khi bạn ứng tuyển công việc. Dưới đây là thông tin đăng nhập của bạn:</p>
              
              <div class="credentials">
                <div class="credential-item">
                  <span class="label">Email:</span>
                  <span class="value">${email}</span>
                </div>
                <div class="credential-item">
                  <span class="label">Tên đăng nhập:</span>
                  <span class="value">${username}</span>
                </div>
                <div class="credential-item">
                  <span class="label">Mật khẩu:</span>
                  <span class="value">${password}</span>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu để bảo mật tài khoản</li>
                  <li>Không chia sẻ thông tin đăng nhập với bất kỳ ai</li>
                  <li>Bạn có thể đăng nhập bằng email hoặc tên đăng nhập</li>
                </ul>
              </div>
              
              <p>Bạn có thể đăng nhập tại: <a href="${frontendUrl}/auth/login" style="color: #3b82f6; text-decoration: none;">Trang đăng nhập</a></p>
              
              <p>Chúc bạn tìm được công việc phù hợp!</p>
              
              <p>Trân trọng,<br><strong>Đội ngũ TopViec</strong></p>
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>&copy; ${new Date().getFullYear()} TopViec. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Account credentials email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send account credentials email to ${email}:`, error);
      // Don't throw error to prevent application creation failure
      // Email sending failure should not block user creation
    }
  }
}


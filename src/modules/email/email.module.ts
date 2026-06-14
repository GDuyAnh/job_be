import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailSettings } from './email-settings.entity';
import { EmailSettingsService } from './email-settings.service';
import { EmailTemplate } from './email-template.entity';
import { EmailTemplateService } from './email-template.service';
import { PasswordResetToken } from './password-reset-token.entity';
import { PasswordResetService } from './password-reset.service';
import { EmailSchedulerService } from './email-scheduler.service';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailSettings,
      EmailTemplate,
      PasswordResetToken,
      Job,
      User,
    ]),
  ],
  providers: [
    EmailSettingsService,
    EmailTemplateService,
    EmailService,
    PasswordResetService,
    EmailSchedulerService,
  ],
  exports: [
    EmailService,
    EmailSettingsService,
    EmailTemplateService,
    PasswordResetService,
  ],
})
export class EmailModule {}

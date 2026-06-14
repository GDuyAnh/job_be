import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';
import { EmailService } from './email.service';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleJobExpiryEmails(): Promise<void> {
    this.logger.log('Running daily job expiry email check...');

    try {
      await Promise.all([
        this.sendExpiringSoonEmails(),
        this.sendExpiredEmails(),
      ]);
    } catch (error) {
      this.logger.error('Job expiry email cron failed:', error);
    }
  }

  private async sendExpiringSoonEmails(): Promise<void> {
    const now = new Date();
    const inThreeDays = new Date(now);
    inThreeDays.setDate(now.getDate() + 3);

    const jobs = await this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where("job.status = 'APPROVED'")
      .andWhere('job.deadline >= :now', { now })
      .andWhere('job.deadline <= :inThreeDays', { inThreeDays })
      .getMany();

    for (const job of jobs) {
      const recipient = await this.resolveJobHostEmail(job);
      if (!recipient) continue;

      const daysLeft = Math.max(
        0,
        Math.ceil(
          (new Date(job.deadline).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      await this.emailService.sendByTemplate('JOB_EXPIRING_SOON', recipient.email, {
        fullName: recipient.fullName,
        jobTitle: job.title,
        deadline: new Date(job.deadline).toLocaleDateString('vi-VN'),
        daysLeft: String(daysLeft),
      });
    }
  }

  private async sendExpiredEmails(): Promise<void> {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const jobs = await this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where("job.status = 'APPROVED'")
      .andWhere('job.deadline < :now', { now })
      .andWhere('job.deadline >= :yesterday', { yesterday })
      .getMany();

    for (const job of jobs) {
      const recipient = await this.resolveJobHostEmail(job);
      if (!recipient) continue;

      await this.emailService.sendByTemplate('JOB_EXPIRED', recipient.email, {
        fullName: recipient.fullName,
        jobTitle: job.title,
        deadline: new Date(job.deadline).toLocaleDateString('vi-VN'),
      });
    }
  }

  private async resolveJobHostEmail(
    job: Job,
  ): Promise<{ email: string; fullName: string } | null> {
    const host = await this.usersRepository.findOne({
      where: { companyId: job.companyId, isHostCompany: true },
    });

    if (host?.email) {
      return { email: host.email, fullName: host.fullName };
    }

    if (job.userId) {
      const creator = await this.usersRepository.findOne({
        where: { id: job.userId },
      });
      if (creator?.email) {
        return { email: creator.email, fullName: creator.fullName };
      }
    }

    return null;
  }
}

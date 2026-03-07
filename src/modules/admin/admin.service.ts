import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { Job } from '../jobs/job.entity';
import { JobApplication } from '../jobs/job-application.entity';
import { User } from '../users/user.entity';
import { AdminApplicationResponseDto } from './dto/admin-application-response.dto';

export interface AdminStatsDto {
  companiesCount: number;
  jobsCount: number;
  applicationsCount: number;
  usersCount: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly jobApplicationRepository: Repository<JobApplication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStats(): Promise<AdminStatsDto> {
    const [companiesCount, jobsCount, applicationsCount, usersCount] =
      await Promise.all([
        this.companyRepository.count(),
        this.getActiveJobsCount(),
        this.getActiveApplicationsCount(),
        this.userRepository.count(),
      ]);

    return {
      companiesCount,
      jobsCount,
      applicationsCount,
      usersCount,
    };
  }

  /** Số tin tuyển dụng đang hoạt động (đã duyệt, công ty đã duyệt và hiển thị) */
  private async getActiveJobsCount(): Promise<number> {
    return this.jobRepository
      .createQueryBuilder('job')
      .innerJoin('job.company', 'company')
      .where("job.status = 'APPROVED'")
      .andWhere('company.isWaiting = :companyWaiting', {
        companyWaiting: false,
      })
      .andWhere('company.isShow = :companyShow', { companyShow: true })
      .getCount();
  }

  /** Số đơn ứng tuyển cho các tin đang hoạt động */
  private async getActiveApplicationsCount(): Promise<number> {
    return this.jobApplicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .innerJoin('job.company', 'company')
      .where("job.status = 'APPROVED'")
      .andWhere('company.isWaiting = :companyWaiting', {
        companyWaiting: false,
      })
      .andWhere('company.isShow = :companyShow', { companyShow: true })
      .getCount();
  }

  /** Danh sách tất cả đơn ứng tuyển (admin), bỏ qua đã xóa (delF = true) */
  async getAllApplications(): Promise<AdminApplicationResponseDto[]> {
    const applications = await this.jobApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('application.user', 'user')
      .where('application.delF = :delF', { delF: false })
      .orderBy('application.appliedAt', 'DESC')
      .getMany();

    return applications.map((app) => {
      const job = app.job;
      const company = job?.company;
      const user = app.user;
      return new AdminApplicationResponseDto({
        id: app.id,
        jobTitle: job?.title ?? '',
        jobId: app.jobId,
        companyName: company?.name ?? '',
        companyLogo: company?.logo ?? undefined,
        applicantName: user?.fullName ?? '',
        phone: user?.phoneNumber ?? '',
        email: user?.email ?? '',
        cvUrl: app.resumePath ?? undefined,
        category: job?.category ?? '',
        location: job?.location ?? '',
        applicationDate: app.appliedAt,
      });
    });
  }

  /** Admin xóa (soft-delete) đơn ứng tuyển */
  async deleteApplication(applicationId: number): Promise<void> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    await this.jobApplicationRepository.update(applicationId, { delF: true });
  }
}

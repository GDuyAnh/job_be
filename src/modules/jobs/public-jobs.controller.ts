import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Company } from '../companies/company.entity';
import { Job } from './job.entity';
import {
  PublicFreePostRequestDto,
  PublicFreePostResponseDto,
} from './dto/request/public-free-post.dto';
import { RoleStatus } from '@/enum/role';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';

@ApiTags('public-jobs')
@Controller('public/jobs')
export class PublicJobsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  @Post('free-post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Public endpoint to create a free job post with optional company/user creation',
  })
  @ApiResponse({
    status: 200,
    description: 'Job created or submitted for review successfully',
    type: PublicFreePostResponseDto,
  })
  async freePost(
    @Body() body: PublicFreePostRequestDto,
  ): Promise<PublicFreePostResponseDto> {
    const { email, mst, company: companyDto, job: jobDto } = body;

    // 1) Check user by email
    const user = await this.usersService.findByEmail(email);

    // 2) Check company by MST
    const existingCompany = await this.companiesRepository.findOne({
      where: { mst },
    });

    // Utility to build response
    const ok = (message: string, token?: string, user?: any): PublicFreePostResponseDto => ({
      success: true,
      message,
      redirectUrl: '/companies/dashboard?view=manageJobs',
      access_token: token,
      user: user,
    });

    // Helper: create company (isWaiting=true)
    const createCompany = async (): Promise<Company> => {
      const comp = this.companiesRepository.create({
        name: companyDto.name,
        mst: companyDto.mst,
        // For public posting, ignore incoming images to avoid abuse; set defaults
        logo: null,
        bannerImage: null,
        address: companyDto.address || '',
        taxAddress: companyDto.taxAddress || '',
        organizationType: companyDto.organizationType || 1,
        website: companyDto.website || null,
        isWaiting: true, // require admin approval
      });
      const saved = await this.companiesRepository.save(comp);
      // Ignore companyImages on public endpoint to reduce storage usage
      this.notifyAdminsCompanyPending(saved).catch((e) =>
        console.error('Failed to send company pending admin email:', e),
      );
      return saved;
    };

    // Helper: create company user (password auto)
    const createCompanyUser = async (companyId: number, host = false) => {
      const username = email.split('@')[0];
      const defaultPassword = username + '123';
      // Use UsersService.create to ensure hashing + welcome email
      const newUser = await this.usersService.create({
        email,
        username,
        password: defaultPassword,
        fullName: companyDto.name || username,
        phoneNumber: undefined,
        role: RoleStatus.COMPANY,
        companyId,
      } as any);

      if (host) {
        await this.usersService.setHostCompany(newUser.id, companyId, true);
      }
      return { user: newUser, username, defaultPassword };
    };

    // Helper: basic validations for salary and dates (similar to JobsService)
    const normalizeJobData = () => {
      const posted = jobDto.postedDate ? new Date(jobDto.postedDate) : new Date();
      const deadline = new Date(jobDto.deadline);
      if (deadline < posted) {
        throw new BadRequestException(
          'Hạn nộp không được sớm hơn ngày đăng',
        );
      }
      const oneMonthLater = new Date(posted);
      oneMonthLater.setMonth(posted.getMonth() + 1);
      if (deadline > oneMonthLater) {
        throw new BadRequestException(
          'Hạn nộp không được quá 1 tháng sau ngày đăng',
        );
      }
      // Salary validations
      if (jobDto.salaryType !== 5) {
        if (
          jobDto.salaryMin == null ||
          jobDto.salaryMax == null ||
          jobDto.salaryMin < 0 ||
          jobDto.salaryMax < 0 ||
          jobDto.salaryMin > jobDto.salaryMax
        ) {
          throw new BadRequestException('Khoảng lương không hợp lệ');
        }
      } else {
        // Negotiable
        if (jobDto.salaryMin == null) (jobDto as any).salaryMin = 0;
        if (jobDto.salaryMax == null) (jobDto as any).salaryMax = 0;
      }
      return { posted, deadline };
    };

    const createJob = async (companyId: number, userId: number) => {
      const { posted, deadline } = normalizeJobData();
      const entity = this.jobsRepository.create({
        title: jobDto.title,
        detailDescription: jobDto.detailDescription,
        category: jobDto.category,
        location: jobDto.location,
        typeOfEmployment: jobDto.typeOfEmployment,
        experienceLevel: jobDto.experienceLevel ?? null,
        requiredQualification: jobDto.requiredQualification ?? null,
        gender: jobDto.gender ?? null,
        grade: jobDto.grade ?? null,
        companyId,
        userId,
        postedDate: posted,
        deadline,
        salaryMin: jobDto.salaryMin ?? 0,
        salaryMax: jobDto.salaryMax ?? 0,
        salaryType: jobDto.salaryType,
        email: jobDto.email,
        phoneNumber: jobDto.phoneNumber ?? null,
        address: jobDto.address,
        status: 'ADMIN_REVIEW',
        note: 'user',
      } as any);
      const savedJob = await this.jobsRepository.save(entity);
      this.notifyAdminsJobPending(
        Array.isArray(savedJob) ? savedJob[0] : savedJob,
      ).catch((e) =>
        console.error('Failed to send job pending admin email:', e),
      );
    };

    // 3) Branching by existence
    if (!user) {
      // Email NOT exists - need to create user and auto-login
      if (!existingCompany) {
        // A) email not exists + company not exists -> create both then job
        const newCompany = await createCompany();
        const { user: newUser, username, defaultPassword } = await createCompanyUser(newCompany.id, false);
        await createJob(newCompany.id, newUser.id);
        // Auto login and return token
        const loginResult = await this.authService.autoLoginByEmail(email);
        return ok(
          `Đăng tin thành công! Đang chuyển hướng đến dashboard...`,
          loginResult.access_token,
          loginResult.user,
        );
      } else {
        // B) email not exists + company exists -> create user (non-host), job
        const { user: newUser, username, defaultPassword } = await createCompanyUser(existingCompany.id, false);
        await createJob(existingCompany.id, newUser.id);
        // Auto login and return token
        const loginResult = await this.authService.autoLoginByEmail(email);
        return ok(
          `Đăng tin thành công! Đang chuyển hướng đến dashboard...`,
          loginResult.access_token,
          loginResult.user,
        );
      }
    } else {
      // Email EXISTS: validate roles
      if (user.role === RoleStatus.USER) {
        throw new BadRequestException('Email ứng viên không thể đăng job');
      }
      if (user.role === RoleStatus.ADMIN) {
        throw new BadRequestException('Vui lòng đăng job ở dashboard');
      }
      if (user.role === RoleStatus.COMPANY) {
        if (!existingCompany) {
          throw new BadRequestException(
            'Email này không thể đăng tin ở công ty này',
          );
        }
        if (user.companyId !== existingCompany.id) {
          throw new BadRequestException(
            'Email này không thể đăng tin ở công ty này',
          );
        }
        await createJob(existingCompany.id, user.id);
        return ok(
          'Đăng tin thành công! Vui lòng đăng nhập để kiểm tra ở dashboard.',
        );
      }
    }
  }

  private async notifyAdminsCompanyPending(company: Company): Promise<void> {
    const adminEmails = await this.usersService.findAdminEmails();
    if (!adminEmails.length) return;

    await this.emailService.sendToManyByTemplate(
      'COMPANY_PENDING_ADMIN',
      adminEmails,
      {
        companyName: company.name,
        companyMst: company.mst || '',
      },
    );
  }

  private async notifyAdminsJobPending(job: Job): Promise<void> {
    const company = await this.companiesRepository.findOne({
      where: { id: job.companyId },
    });

    const adminEmails = await this.usersService.findAdminEmails();
    if (!adminEmails.length) return;

    await this.emailService.sendToManyByTemplate(
      'JOB_PENDING_ADMIN',
      adminEmails,
      {
        jobTitle: job.title,
        companyName: company?.name || '',
      },
    );
  }
}


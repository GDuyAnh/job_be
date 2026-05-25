import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleStatus } from '@/enum/role';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { SearchJobDto } from './dto/request/search-job-request.dto';
import { JobDetailDto } from './dto/response/job-detail.dto';
import { CategoryStatsDto } from './dto/response/category-stats.dto';
import { LocationStatsDto } from './dto/response/location-stats.dto';
import { JobSearchResponseDto } from './dto/response/search-job-response.dto';
import {
  ALL_CATEGORIES,
  ALL_LOCATIONS,
  MAJOR_CITIES,
  MAJOR_CITIES_IMG,
} from '../constants';
import { CreateJobDto } from './dto/request/create-job.dto';
import { JobResponseDto } from './dto/response/job-response.dto';
import { Company } from '../companies/company.entity';
import { SearchJobAdminDto } from './dto/request/search-job-request-admin.dto';
import { JobApplication } from './job-application.entity';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UsersService } from '../users/users.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(JobApplication)
    private jobApplicationRepository: Repository<JobApplication>,
    private usersService: UsersService,
    private uploadService: UploadService,
  ) {}

  /** Job chỉ hiển thị khi status = APPROVED */
  private static readonly JOB_VISIBLE_CONDITION = "job.status = 'APPROVED'";

  async create(data: CreateJobDto, user?: any): Promise<JobResponseDto> {
    await this.validateJobData(data, false);
    await this.ensureCompanyExists(data.companyId);

    // Authorization check for job creation
    // ADMIN can create job for any company
    // COMPANY can only create job for their own company (must be host)
    const isAdmin = user?.role === RoleStatus.ADMIN;
    const isHostCompany =
      user?.role === RoleStatus.COMPANY &&
      user?.companyId === data.companyId;

    if (!isAdmin && !isHostCompany) {
      throw new UnauthorizedException(
        'Bạn không có quyền tạo tin tuyển dụng cho công ty này',
      );
    }

    const status = (data.status?.trim() || 'ADMIN_REVIEW').toUpperCase();
    const validStatuses = ['ADMIN_REVIEW', 'PENDING', 'APPROVED', 'REJECTED'];
    const jobStatus = validStatuses.includes(status) ? status : 'ADMIN_REVIEW';
    data.status = jobStatus;
    data.userId = data.userId;
    data.detailDescription = (data.detailDescription ?? '').trim();
    const savedJob = await this.jobsRepository.save(
      this.jobsRepository.create(data),
    );
    return this.buildJobResponse(savedJob.id);
  }

  async update(id: number, data: CreateJobDto, user?: any): Promise<JobResponseDto> {
    const job = await this.findJobOrThrow(id);
    const urlsToDelete: string[] = [];

    const maybeQueueReplace = (prev: string | null | undefined, next: any) => {
      if (!prev) return;
      if (next === undefined) return;
      const nextVal = next == null || String(next).trim() === '' ? null : String(next).trim();
      if (nextVal !== prev) urlsToDelete.push(prev);
    };

    maybeQueueReplace(job.imageLogo, (data as any).imageLogo);
    maybeQueueReplace(job.bannerLogo, (data as any).bannerLogo);

    // Authorization check for job update
    // ADMIN can update any job
    // COMPANY can only update job of their own company (must be host)
    const isAdmin = user?.role === RoleStatus.ADMIN;
    const isHostCompany =
      user?.role === RoleStatus.COMPANY &&
      user?.companyId === job.companyId;

    if (!isAdmin && !isHostCompany) {
      throw new UnauthorizedException(
        'Bạn không có quyền chỉnh sửa tin tuyển dụng này',
      );
    }

    if (data.companyId !== undefined) {
      await this.ensureCompanyExists(data.companyId);
    }

    // For update, preserve existing values if not provided
    if (data.salaryMin === undefined || data.salaryMin === null) {
      data.salaryMin = job.salaryMin;
    }
    if (data.salaryMax === undefined || data.salaryMax === null) {
      data.salaryMax = job.salaryMax;
    }
    if (data.salaryType === undefined || data.salaryType === null) {
      data.salaryType = job.salaryType;
    }

    await this.validateJobData(data, true);

    if (data.status !== undefined && data.status !== null) {
      const status = String(data.status).trim().toUpperCase();
      const validStatuses = ['ADMIN_REVIEW', 'PENDING', 'APPROVED', 'REJECTED'];
      (data as any).status = validStatuses.includes(status) ? status : job.status || 'ADMIN_REVIEW';
    }
    // note không đổi khi update — chỉ dùng để biết admin add hay user add lúc tạo
    (data as any).note = job.note ?? 'user';
    if (data.detailDescription !== undefined) {
      data.detailDescription = (data.detailDescription ?? '').trim();
    }
    await this.jobsRepository.save({ ...job, ...data });

    if (urlsToDelete.length > 0) {
      this.uploadService.deleteBatch(urlsToDelete).catch((e) => console.error('R2 delete (job update) failed:', e));
    }
    return this.buildJobResponse(id);
  }

  async findAll(): Promise<JobResponseDto[]> {
    const jobs = await this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where(JobsService.JOB_VISIBLE_CONDITION)
      .andWhere('company.isWaiting = :companyWaiting', { companyWaiting: false })
      .getMany();
    return jobs.map((job) => new JobResponseDto(job));
  }

  async searchJobs(dto: SearchJobDto): Promise<JobSearchResponseDto[]> {
    const qb = this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where('company.isWaiting = :companyWaiting', { companyWaiting: false });

    // keyword: title/description (case-insensitive)
    if (dto.keyword?.trim()) {
      qb.andWhere(
        '(LOWER(job.title) LIKE LOWER(:kw) OR LOWER(job.detailDescription) LIKE LOWER(:kw))',
        { kw: `%${dto.keyword.trim()}%` },
      );
    }

    // category - search in comma-separated string
    if (
      dto.category !== undefined &&
      dto.category !== null &&
      dto.category !== ALL_CATEGORIES
    ) {
      // Use LIKE to find category in comma-separated string
      // Match: exact match, start, middle, or end of string
      qb.andWhere(
        '(job.category = :c OR job.category LIKE :cStart OR job.category LIKE :cMiddle OR job.category LIKE :cEnd)',
        {
          c: String(dto.category),
          cStart: `${dto.category},%`,
          cMiddle: `%,${dto.category},%`,
          cEnd: `%,${dto.category}`,
        },
      );
    }

    // location - search in comma-separated string
    if (
      dto.location !== undefined &&
      dto.location !== null &&
      dto.location !== ALL_LOCATIONS
    ) {
      // Use LIKE to find location in comma-separated string
      // Match: exact match, start, middle, or end of string
      qb.andWhere(
        '(job.location = :l OR job.location LIKE :lStart OR job.location LIKE :lMiddle OR job.location LIKE :lEnd)',
        {
          l: String(dto.location),
          lStart: `${dto.location},%`,
          lMiddle: `%,${dto.location},%`,
          lEnd: `%,${dto.location}`,
        },
      );
    }

    // typeOfEmployment (array)
    if (dto.typeOfEmployment?.length > 0) {
      qb.andWhere('job.typeOfEmployment IN (:...toe)', {
        toe: dto.typeOfEmployment,
      });
    }

    // experienceLevel (array)
    if (dto.experienceLevel?.length > 0) {
      qb.andWhere('job.experienceLevel IN (:...exp)', {
        exp: dto.experienceLevel,
      });
    }

    // grade (array)
    if (dto.grade?.length > 0) {
      qb.andWhere('job.grade IN (:...grade)', {
        grade: dto.grade,
      });
    }

    // companyId
    if (dto.companyId !== undefined && dto.companyId !== null) {
      qb.andWhere('job.companyId = :cid', { cid: dto.companyId });
    }

    // email - filter by contact email
    if (dto.email?.trim()) {
      qb.andWhere('job.email = :email', { email: dto.email.trim() });
    }

    // Viewer: CHỈ thấy job đã duyệt (status = APPROVED hoặc legacy)
    qb.andWhere(JobsService.JOB_VISIBLE_CONDITION);

    qb.orderBy('job.postedDate', 'DESC');

    const jobs = await qb.getMany();

    return jobs.map((job) => new JobSearchResponseDto(job));
  }

  async getJobDetail(jobId: number): Promise<JobDetailDto> {
    const job = await this.jobsRepository.findOne({
      where: { id: jobId },
      relations: ['company'],
    });
    if (!job || job.status !== 'APPROVED') {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }
    if (job.company && job.company.isWaiting) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }
    return new JobDetailDto(job);
  }

  async getJobsByUserId(userId: number): Promise<JobResponseDto[]> {
    const jobs = await this.jobsRepository.find({
      where: { userId: userId },
      relations: ['company'],
    });

    return jobs.map((job) => new JobResponseDto(job));
  }

  async getJobsByEmail(email: string): Promise<JobResponseDto[]> {
    const jobs = await this.jobsRepository.find({
      where: { email: email },
      relations: ['company'],
      order: { postedDate: 'DESC' },
    });

    return jobs.map((job) => new JobResponseDto(job));
  }

  async getCategoriesWithJobCount(): Promise<CategoryStatsDto[]> {
    const jobs = await this.jobsRepository
      .createQueryBuilder('job')
      .leftJoin('job.company', 'company')
      .where(JobsService.JOB_VISIBLE_CONDITION)
      .andWhere('company.isWaiting = :companyWaiting', { companyWaiting: false })
      .getMany();

    // Count jobs per category
    const categoryCountMap = new Map<string, number>();

    // Process each job's category string
    jobs.forEach((job) => {
      if (job.category) {
        // Split comma-separated string into individual categories
        const categories = job.category
          .split(',')
          .map((cat) => cat.trim())
          .filter((cat) => cat !== '');

        // Count each category
        categories.forEach((category) => {
          const currentCount = categoryCountMap.get(category) || 0;
          categoryCountMap.set(category, currentCount + 1);
        });
      }
    });

    // Convert map to array and sort by count descending
    const result = Array.from(categoryCountMap.entries())
      .map(([category, jobCount]) => ({
        category,
        jobCount,
      }))
      .sort((a, b) => b.jobCount - a.jobCount);

    return result.map(
      (item) => new CategoryStatsDto(item.category, item.jobCount),
    );
  }

  async getLocationsWithJobCount(): Promise<LocationStatsDto[]> {
    const cities = MAJOR_CITIES;
    const cityImages = MAJOR_CITIES_IMG;

    const jobs = await this.jobsRepository
      .createQueryBuilder('job')
      .leftJoin('job.company', 'company')
      .where(JobsService.JOB_VISIBLE_CONDITION)
      .andWhere('company.isWaiting = :companyWaiting', { companyWaiting: false })
      .getMany();

    // Count jobs per individual location from comma-separated strings
    const locationMap = new Map<number, number>();

    jobs.forEach((job) => {
      if (job.location) {
        const locations = job.location
          .split(',')
          .map((l) => l.trim())
          .filter((l) => l);

        locations.forEach((loc) => {
          const locNum = Number(loc);

          if (!isNaN(locNum)) {
            locationMap.set(locNum, (locationMap.get(locNum) || 0) + 1);
          }
        });
      }
    });

    const response: LocationStatsDto[] = [];

    cities.forEach((city, index) => {
      const jobCount = locationMap.get(Number(city)) || 0;
      const image = cityImages[index] || null;

      response.push(
        new LocationStatsDto({
          location: city,
          jobCount: jobCount,
          isMajorCity: true,
          image: image,
        }),
      );
    });

    return response;
  }

  async delete(id: number): Promise<void> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} Không tìm thấy`);
    }

    const urlsToDelete = [job.imageLogo, job.bannerLogo].filter(Boolean) as string[];
    if (urlsToDelete.length > 0) {
      this.uploadService.deleteBatch(urlsToDelete).catch((e) => console.error('R2 delete (job delete) failed:', e));
    }
    await this.jobsRepository.delete(id);
  }

  async listForAdmin(
    dto: SearchJobAdminDto,
    user?: any,
  ): Promise<JobSearchResponseDto[]> {
    // Authorization check for COMPANY role
    if (user?.role === RoleStatus.COMPANY) {
      // Only host company can access
      if (!user?.isHostCompany) {
        throw new UnauthorizedException(
          'Bạn không có quyền truy cập danh sách tin tuyển dụng',
        );
      }
      // Host can only see jobs of their own company
      if (user?.companyId) {
        dto.companyId = user.companyId;
      }
    }

    const qb = this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company');

    // keyword: title/description (case-insensitive)
    if (dto.keyword?.trim()) {
      qb.andWhere(
        '(LOWER(job.title) LIKE LOWER(:kw) OR LOWER(job.detailDescription) LIKE LOWER(:kw))',
        { kw: `%${dto.keyword.trim()}%` },
      );
    }

    // category - search in comma-separated string
    if (
      dto.category !== undefined &&
      dto.category !== null &&
      dto.category !== ALL_CATEGORIES
    ) {
      // Use LIKE to find category in comma-separated string
      qb.andWhere(
        '(job.category = :c OR job.category LIKE :cStart OR job.category LIKE :cMiddle OR job.category LIKE :cEnd)',
        {
          c: String(dto.category),
          cStart: `${dto.category},%`,
          cMiddle: `%,${dto.category},%`,
          cEnd: `%,${dto.category}`,
        },
      );
    }

    // location
    if (
      dto.location !== undefined &&
      dto.location !== null &&
      dto.location !== ALL_LOCATIONS
    ) {
      qb.andWhere('job.location = :l', { l: dto.location });
    }

    // typeOfEmployment (array)
    if (dto.typeOfEmployment?.length > 0) {
      qb.andWhere('job.typeOfEmployment IN (:...toe)', {
        toe: dto.typeOfEmployment,
      });
    }

    // experienceLevel (array)
    if (dto.experienceLevel?.length > 0) {
      qb.andWhere('job.experienceLevel IN (:...exp)', {
        exp: dto.experienceLevel,
      });
    }

    // companyId
    if (dto.companyId !== undefined && dto.companyId !== null) {
      qb.andWhere('job.companyId = :cid', { cid: dto.companyId });
    }

    if (dto.status?.trim()) {
      qb.andWhere('job.status = :status', { status: dto.status.trim().toUpperCase() });
    }

    // (Tuỳ chọn) nếu SearchJobAdminDto có thêm userId:
    // if (dto.userId) { qb.andWhere('job.userId = :uid', { uid: dto.userId }); }

    qb.orderBy('job.postedDate', 'DESC');

    const jobs = await qb.getMany();
    const jobIds = jobs.map((j) => j.id);

    // Count applications per job (chưa xóa: delF = false)
    const countMap = new Map<number, number>();
    if (jobIds.length > 0) {
      const counts = await this.jobApplicationRepository
        .createQueryBuilder('a')
        .select('a.jobId', 'jobId')
        .addSelect('COUNT(a.id)', 'cnt')
        .where('a.jobId IN (:...ids)', { ids: jobIds })
        .andWhere('a.delF = :delF', { delF: false })
        .groupBy('a.jobId')
        .getRawMany();
      counts.forEach((row: { jobId: number; cnt: string }) => {
        countMap.set(Number(row.jobId), parseInt(row.cnt, 10) || 0);
      });
    }

    return jobs.map((job) => {
      const totalApplications = countMap.get(job.id) ?? 0;
      return new JobSearchResponseDto({ ...job, totalApplications });
    });
  }

  async approve(id: number, user: any): Promise<JobResponseDto> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }
    if (job.status === 'APPROVED') {
      throw new BadRequestException('Tin tuyển dụng đã được duyệt');
    }

    // Authorization check: only admin or host company of this job can approve
    const isAdmin = user.role === RoleStatus.ADMIN;
    const isHostOfCompany = user.isHostCompany === true && user.companyId === job.companyId;

    if (!isAdmin && !isHostOfCompany) {
      throw new ForbiddenException('Bạn không có quyền duyệt tin đăng này');
    }

    job.status = 'APPROVED';
    const updated = await this.jobsRepository.save(job);
    return this.buildJobResponse(updated.id);
  }

  /* ================= Helper Methods ================= */

  private async ensureCompanyExists(companyId: number): Promise<void> {
    const exists = await this.companiesRepository.exists({
      where: { id: companyId },
    });
    if (!exists) {
      throw new NotFoundException(`Company with ID ${companyId} Không tìm thấy`);
    }
  }

  private async findJobOrThrow(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} Không tìm thấy`);
    }
    return job;
  }

  private async buildJobResponse(jobId: number): Promise<JobResponseDto> {
    const jobWithRelations = await this.jobsRepository.findOne({
      where: { id: jobId },
      relations: ['company'],
    });

    if (!jobWithRelations) {
      throw new NotFoundException(`Job with ID ${jobId} Không tìm thấy`);
    }

    return new JobResponseDto(jobWithRelations);
  }

  private async validateJobData(
    jobData: CreateJobDto,
    isUpdate: boolean = false,
  ) {
    if (!jobData.postedDate) {
      jobData.postedDate = new Date();
    } else {
      jobData.postedDate = new Date(jobData.postedDate);
    }

    jobData.deadline = new Date(jobData.deadline);

    // Validate salary fields based on salaryType
    // salaryType = 5 means "Thỏa thuận" (Negotiable), so salaryMin/Max are optional
    if (jobData.salaryType !== 5) {
      // If salaryType is not "Negotiable", salaryMin and salaryMax are required
      if (jobData.salaryMin === undefined || jobData.salaryMin === null) {
        throw new BadRequestException(
          'Lương tối thiểu là bắt buộc khi loại lương không phải thỏa thuận',
        );
      }
      if (jobData.salaryMax === undefined || jobData.salaryMax === null) {
        throw new BadRequestException(
          'Lương tối đa là bắt buộc khi loại lương không phải thỏa thuận',
        );
      }

      if (jobData.salaryMin < 0 || jobData.salaryMax < 0) {
        throw new BadRequestException('Mức lương không được âm');
      }

      if (jobData.salaryMin > jobData.salaryMax) {
        throw new BadRequestException(
          'Lương tối thiểu không được lớn hơn lương tối đa',
        );
      }
    } else {
      // For "Negotiable" (salaryType = 5), salaryMin/Max are optional
      // Set default values to 0 if not provided (since DB doesn't allow null)
      if (jobData.salaryMin === undefined || jobData.salaryMin === null) {
        jobData.salaryMin = 0;
      }
      if (jobData.salaryMax === undefined || jobData.salaryMax === null) {
        jobData.salaryMax = 0;
      }
      // But if provided, they must be valid
      if (jobData.salaryMin < 0) {
        throw new BadRequestException('Lương tối thiểu không được âm');
      }
      if (jobData.salaryMax < 0) {
        throw new BadRequestException('Lương tối đa không được âm');
      }
      if (
        jobData.salaryMin > 0 &&
        jobData.salaryMax > 0 &&
        jobData.salaryMin > jobData.salaryMax
      ) {
        throw new BadRequestException(
          'Lương tối thiểu không được lớn hơn lương tối đa',
        );
      }
    }

    if (jobData.deadline < jobData.postedDate) {
      throw new BadRequestException(
        'Hạn nộp không được sớm hơn ngày đăng',
      );
    }

    const oneMonthLater = new Date(jobData.postedDate);
    oneMonthLater.setMonth(jobData.postedDate.getMonth() + 1);

    if (jobData.deadline > oneMonthLater) {
      throw new BadRequestException(
        'Hạn nộp không được quá 1 tháng sau ngày đăng',
      );
    }
  }

  async getApplicationsByUserId(userId: number): Promise<any[]> {
    const applications = await this.jobApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .where('application.userId = :userId', { userId })
      .andWhere('application.delF = :delF', { delF: false })
      .orderBy('application.appliedAt', 'DESC')
      .getMany();

    return applications.map((app) => ({
      id: app.id,
      jobId: app.job.id,
      jobTitle: app.job.title,
      companyName: app.job.company?.name || '',
      location: app.job.location || '',
      category: app.job.category || '',
      typeOfEmployment: app.job.typeOfEmployment || null,
      resumePath: app.resumePath || null,
      appliedAt: app.appliedAt,
      job: {
        id: app.job.id,
        title: app.job.title,
        companyName: app.job.company?.name || '',
        location: app.job.location || '',
        category: app.job.category || '',
        typeOfEmployment: app.job.typeOfEmployment || null,
      },
    }));
  }

  async softDeleteApplication(
    applicationId: number,
    userId: number,
  ): Promise<void> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id: applicationId, userId },
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ hoặc không có quyền');
    }

    const urlsToDelete = [application.resumePath, application.coverLetterUrl].filter(Boolean) as string[];
    await this.jobApplicationRepository.update(applicationId, { delF: true });
    if (urlsToDelete.length > 0) {
      this.uploadService.deleteBatch(urlsToDelete).catch((e) => console.error('R2 delete (application soft delete) failed:', e));
    }
  }

  async createApplication(
    dto: CreateJobApplicationDto,
  ): Promise<{ application: JobApplication; user: any; isNewUser: boolean }> {
    // Check if job exists
    const job = await this.jobsRepository.findOne({ where: { id: dto.jobId } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${dto.jobId} Không tìm thấy`);
    }

    let userId = dto.userId;
    let isNewUser = false;
    let user = null;

    // If no userId provided, find or create user by email
    if (!userId) {
      user = await this.usersService.findOrCreateUserByEmail(
        dto.email,
        dto.fullName,
        dto.phone,
        dto.cvUrl,
        dto.coverLetterUrl,
        dto.coverLetter,
      );
      userId = user.id;

      // Check if user was just created (by checking if they have no other applications)
      const existingApplicationsCount =
        await this.jobApplicationRepository.count({
          where: { userId: user.id },
        });
      isNewUser = existingApplicationsCount === 0;
    } else {
      // User is logged in - Update their CV and Cover Letter in profile
      user = await this.usersService.findOrCreateUserByEmail(
        dto.email,
        dto.fullName,
        dto.phone,
        dto.cvUrl,
        dto.coverLetterUrl,
        dto.coverLetter,
      );
    }

    // Check if user already applied for this job
    const existingApplication = await this.jobApplicationRepository.findOne({
      where: { jobId: dto.jobId, userId: userId },
    });

    if (existingApplication) {
      throw new BadRequestException('Bạn đã ứng tuyển tin này rồi');
    }

    // Create new application
    const application = this.jobApplicationRepository.create({
      jobId: dto.jobId,
      userId: userId,
      resumePath: dto.cvUrl, // Store CV URL in resumePath
      coverLetterText: dto.coverLetter || null, // Store cover letter text
      coverLetterUrl: dto.coverLetterUrl || null, // Store cover letter file URL
      appliedAt: new Date(),
      delF: false,
    });

    const savedApplication =
      await this.jobApplicationRepository.save(application);

    return {
      application: savedApplication,
      user: user,
      isNewUser: isNewUser,
    };
  }
}

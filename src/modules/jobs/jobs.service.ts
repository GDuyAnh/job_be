import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(data: CreateJobDto): Promise<JobResponseDto> {
    await this.validateJobData(data, false);
    await this.ensureCompanyExists(data.companyId);

    data.isWaiting = false;
    data.userId = data.userId;
    // Tạo job (benefits đã được lưu trực tiếp trong data)
    const savedJob = await this.jobsRepository.save(
      this.jobsRepository.create(data),
    );

    // Trả về DTO
    return this.buildJobResponse(savedJob.id);
  }

  async update(id: number, data: CreateJobDto): Promise<JobResponseDto> {
    const job = await this.findJobOrThrow(id);

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

    // Cập nhật job (benefits đã được lưu trực tiếp trong data)
    await this.jobsRepository.save({ ...job, ...data });

    return this.buildJobResponse(id);
  }

  async findAll(): Promise<JobResponseDto[]> {
    const jobs = await this.jobsRepository.find({
      where: { isWaiting: false },
    });
    return jobs.map((job) => new JobResponseDto(job));
  }

  async searchJobs(dto: SearchJobDto): Promise<JobSearchResponseDto[]> {
    const qb = this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company');

    // keyword: title/description (case-insensitive)
    if (dto.keyword?.trim()) {
      qb.andWhere(
        '(LOWER(job.title) LIKE LOWER(:kw) OR LOWER(job.description) LIKE LOWER(:kw))',
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

    // isFeatured
    if (dto.isFeatured !== undefined && dto.isFeatured !== null) {
      qb.andWhere('job.isFeatured = :f', { f: dto.isFeatured });
    }

    // companyId
    if (dto.companyId !== undefined && dto.companyId !== null) {
      qb.andWhere('job.companyId = :cid', { cid: dto.companyId });
    }

    // Viewer: CHỈ thấy job đã duyệt
    qb.andWhere('job.isWaiting = :w', { w: false });

    qb.orderBy('job.postedDate', 'DESC');

    const jobs = await qb.getMany();

    return jobs.map((job) => new JobSearchResponseDto(job));
  }

  async getJobDetail(jobId: number): Promise<JobDetailDto> {
    const job = await this.jobsRepository.findOne({
      where: { id: jobId },
      relations: ['company'],
    });
    if (!job || job.isWaiting) {
      throw new NotFoundException('Job not found');
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

  async getCategoriesWithJobCount(): Promise<CategoryStatsDto[]> {
    // Get all jobs
    const jobs = await this.jobsRepository.find({
      where: { isWaiting: false }, // Only count approved jobs
    });

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

    // Get all approved jobs
    const jobs = await this.jobsRepository.find({
      where: { isWaiting: false },
    });

    // Count jobs per individual location from comma-separated strings
    const locationMap = new Map<number, number>();

    jobs.forEach((job) => {
      if (job.location) {
        const locations = job.location.split(',').map((l) => l.trim()).filter((l) => l);

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
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    await this.jobsRepository.delete(id);
  }

  async listForAdmin(dto: SearchJobAdminDto): Promise<JobSearchResponseDto[]> {
    const qb = this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company');

    // keyword: title/description (case-insensitive)
    if (dto.keyword?.trim()) {
      qb.andWhere(
        '(LOWER(job.title) LIKE LOWER(:kw) OR LOWER(job.description) LIKE LOWER(:kw))',
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

    // isFeatured
    if (dto.isFeatured !== undefined && dto.isFeatured !== null) {
      qb.andWhere('job.isFeatured = :f', { f: dto.isFeatured });
    }

    // companyId
    if (dto.companyId !== undefined && dto.companyId !== null) {
      qb.andWhere('job.companyId = :cid', { cid: dto.companyId });
    }

    // Admin: chỉ lọc theo isWaiting nếu được truyền (nếu không truyền → trả cả pending & approved)
    if (typeof dto.isWaiting === 'boolean') {
      qb.andWhere('job.isWaiting = :w', { w: dto.isWaiting });
    }

    // (Tuỳ chọn) nếu SearchJobAdminDto có thêm userId:
    // if (dto.userId) { qb.andWhere('job.userId = :uid', { uid: dto.userId }); }

    qb.orderBy('job.postedDate', 'DESC');

    const jobs = await qb.getMany();

    return jobs.map((job) => new JobSearchResponseDto(job));
  }

  async approve(id: number): Promise<JobResponseDto> {
    // 1. Tìm job
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // 2. Chỉ khi pending mới approve
    if (!job.isWaiting) {
      throw new BadRequestException('Job has already been approved');
    }

    // 3. Cập nhật trạng thái sang đã duyệt
    job.isWaiting = false;

    const updated = await this.jobsRepository.save(job);

    // 4. Trả về DTO chuẩn
    return this.buildJobResponse(updated.id);
  }

  /* ================= Helper Methods ================= */

  private async ensureCompanyExists(companyId: number): Promise<void> {
    const exists = await this.companiesRepository.exists({
      where: { id: companyId },
    });
    if (!exists) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }
  }

  private async findJobOrThrow(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  private async buildJobResponse(jobId: number): Promise<JobResponseDto> {
    const jobWithRelations = await this.jobsRepository.findOne({
      where: { id: jobId },
      relations: ['company'],
    });

    if (!jobWithRelations) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
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
        throw new BadRequestException('Salary Min is required when salary type is not negotiable');
      }
      if (jobData.salaryMax === undefined || jobData.salaryMax === null) {
        throw new BadRequestException('Salary Max is required when salary type is not negotiable');
      }

      if (jobData.salaryMin < 0 || jobData.salaryMax < 0) {
        throw new BadRequestException('Salary must be non-negative');
      }

      if (jobData.salaryMin > jobData.salaryMax) {
        throw new BadRequestException(
          'Minimum salary cannot be greater than maximum salary',
        );
      }
    } else {
      // For "Negotiable" (salaryType = 5), salaryMin/Max are optional
      // But if provided, they must be valid
      if (jobData.salaryMin !== undefined && jobData.salaryMin !== null) {
        if (jobData.salaryMin < 0) {
          throw new BadRequestException('Salary Min must be non-negative');
        }
      }
      if (jobData.salaryMax !== undefined && jobData.salaryMax !== null) {
        if (jobData.salaryMax < 0) {
          throw new BadRequestException('Salary Max must be non-negative');
        }
      }
      if (
        jobData.salaryMin !== undefined &&
        jobData.salaryMin !== null &&
        jobData.salaryMax !== undefined &&
        jobData.salaryMax !== null &&
        jobData.salaryMin > jobData.salaryMax
      ) {
        throw new BadRequestException(
          'Minimum salary cannot be greater than maximum salary',
        );
      }
    }

    if (jobData.deadline < jobData.postedDate) {
      throw new BadRequestException(
        'Deadline cannot be earlier than posted date',
      );
    }

    const oneMonthLater = new Date(jobData.postedDate);
    oneMonthLater.setMonth(jobData.postedDate.getMonth() + 1);

    if (jobData.deadline > oneMonthLater) {
      throw new BadRequestException(
        'Deadline cannot be more than 1 month after posted date',
      );
    }
  }
}

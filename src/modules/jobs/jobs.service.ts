import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Job } from './job.entity';
import { JobBenefit } from './job-benefit.entity';
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
    @InjectRepository(JobBenefit)
    private jobBenefitRepository: Repository<JobBenefit>,
  ) {}

  async create(data: CreateJobDto): Promise<JobResponseDto> {
    await this.validateJobData(data);
    await this.ensureCompanyExists(data.companyId);

    const { benefits, ...jobData } = data;

    jobData.isWaiting = true;

    // 1. Tạo job
    const savedJob = await this.jobsRepository.save(
      this.jobsRepository.create(jobData),
    );

    // 2. Cập nhật benefits
    await this.updateJobBenefits(savedJob.id, benefits);

    // 3. Trả về DTO
    return this.buildJobResponse(savedJob.id);
  }

  async update(id: number, data: CreateJobDto): Promise<JobResponseDto> {
    await this.validateJobData(data);
    const job = await this.findJobOrThrow(id);

    if (data.companyId !== undefined) {
      await this.ensureCompanyExists(data.companyId);
    }

    const { benefits, ...jobData } = data;

    jobData.isWaiting = true;

    // Cập nhật job
    await this.jobsRepository.save({ ...job, ...jobData });

    // Cập nhật benefits
    await this.updateJobBenefits(id, benefits);

    return this.buildJobResponse(id);
  }

  async findAll(): Promise<JobResponseDto[]> {
    const jobs = await this.jobsRepository.find({
      where: { isWaiting: false },
    });
    for (const job of jobs) {
      job.jobBenefits = await this.jobBenefitRepository.find({
        where: { jobId: job.id },
      });
    }
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

    // category
    if (
      dto.category !== undefined &&
      dto.category !== null &&
      dto.category !== ALL_CATEGORIES
    ) {
      qb.andWhere('job.category = :c', { c: dto.category });
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

    // Viewer: CHỈ thấy job đã duyệt
    qb.andWhere('job.isWaiting = :w', { w: false });

    qb.orderBy('job.postedDate', 'DESC');

    const jobs = await qb.getMany();

    for (const job of jobs) {
      job.jobBenefits = await this.jobBenefitRepository.find({
        where: { jobId: job.id },
      });
    }

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
    job.jobBenefits = await this.jobBenefitRepository.find({
      where: { jobId: job.id },
    });
    return new JobDetailDto(job);
  }

  async getCategoriesWithJobCount(): Promise<CategoryStatsDto[]> {
    const result = await this.jobsRepository
      .createQueryBuilder('job')
      .select('job.category', 'category')
      .addSelect('COUNT(job.id)', 'jobCount')
      .groupBy('job.category')
      .orderBy('jobCount', 'DESC')
      .getRawMany();

    return result.map(
      (item) =>
        new CategoryStatsDto(
          Number(item.category),
          parseInt(item.jobCount, 10),
        ),
    );
  }

  async getLocationsWithJobCount(): Promise<LocationStatsDto[]> {
    const cities = MAJOR_CITIES;
    const cityImages = MAJOR_CITIES_IMG;

    const result = await this.jobsRepository
      .createQueryBuilder('job')
      .select('job.location', 'location')
      .addSelect('COUNT(job.id)', 'jobCount')
      .groupBy('job.location')
      .orderBy('jobCount', 'DESC')
      .getRawMany();

    const locationMap = new Map<number, number>();
    result.forEach((item) => {
      locationMap.set(Number(item.location), parseInt(item.jobCount, 10));
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

    await this.jobBenefitRepository.delete({ jobId: id });
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

    // category
    if (
      dto.category !== undefined &&
      dto.category !== null &&
      dto.category !== ALL_CATEGORIES
    ) {
      qb.andWhere('job.category = :c', { c: dto.category });
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

    for (const job of jobs) {
      job.jobBenefits = await this.jobBenefitRepository.find({
        where: { jobId: job.id },
      });
    }

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

  private async updateJobBenefits(
    jobId: number,
    benefits?: number[],
  ): Promise<void> {
    await this.jobBenefitRepository.delete({ jobId });

    if (Array.isArray(benefits) && benefits.length > 0) {
      const jobBenefits = benefits.map((benefitId) =>
        this.jobBenefitRepository.create({ jobId, benefitId }),
      );
      await this.jobBenefitRepository.save(jobBenefits);
    }
  }

  private async buildJobResponse(jobId: number): Promise<JobResponseDto> {
    const jobWithRelations = await this.jobsRepository.findOne({
      where: { id: jobId },
      relations: ['company'],
    });

    if (!jobWithRelations) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    jobWithRelations.jobBenefits = await this.jobBenefitRepository.find({
      where: { jobId },
    });

    return new JobResponseDto(jobWithRelations);
  }

  private async validateJobData(jobData: CreateJobDto) {
    if (!jobData.postedDate) {
      jobData.postedDate = new Date();
    } else {
      jobData.postedDate = new Date(jobData.postedDate);
    }

    jobData.deadline = new Date(jobData.deadline);

    if (jobData.salaryMin < 0 || jobData.salaryMax < 0) {
      throw new BadRequestException('Salary must be non-negative');
    }

    if (jobData.salaryMin > jobData.salaryMax) {
      throw new BadRequestException(
        'Minimum salary cannot be greater than maximum salary',
      );
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

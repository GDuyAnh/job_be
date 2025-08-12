import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
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

    // Cập nhật job
    await this.jobsRepository.save({ ...job, ...jobData });

    // Cập nhật benefits
    await this.updateJobBenefits(id, benefits);

    return this.buildJobResponse(id);
  }

  async findAll(): Promise<JobResponseDto[]> {
    const jobs = await this.jobsRepository.find();
    for (const job of jobs) {
      job.jobBenefits = await this.jobBenefitRepository.find({
        where: { jobId: job.id },
      });
    }
    return jobs.map((job) => new JobResponseDto(job));
  }

  async searchJobs(dto: SearchJobDto): Promise<JobSearchResponseDto[]> {
    const where: any = {};

    if (dto.keyword?.trim()) {
      where.title = Like(`%${dto.keyword.trim()}%`);
    }

    if (
      dto.category !== undefined &&
      dto.category !== null &&
      dto.category !== ALL_CATEGORIES
    ) {
      where.category = dto.category;
    }

    if (
      dto.location !== undefined &&
      dto.location !== null &&
      dto.location !== ALL_LOCATIONS
    ) {
      where.location = dto.location;
    }

    if (dto.typeOfEmployment?.length > 0) {
      where.typeOfEmployment = In(dto.typeOfEmployment);
    }

    if (dto.experienceLevel?.length > 0) {
      where.experienceLevel = In(dto.experienceLevel);
    }

    // boolean
    if (dto.isFeatured !== undefined && dto.isFeatured !== null) {
      where.isFeatured = dto.isFeatured;
    }

    const jobs = await this.jobsRepository.find({
      where,
      relations: ['company'],
    });

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
    if (!job) {
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
    // Nếu không có postedDate thì mặc định = hôm nay
    if (!jobData.postedDate) {
      jobData.postedDate = new Date();
    } else {
      jobData.postedDate = new Date(jobData.postedDate);
    }

    // Nếu FE gửi deadline dưới dạng string thì parse sang Date
    jobData.deadline = new Date(jobData.deadline);

    // Validate salary >= 0
    if (jobData.salaryMin < 0 || jobData.salaryMax < 0) {
      throw new BadRequestException('Salary must be non-negative');
    }

    // salaryMin <= salaryMax
    if (jobData.salaryMin > jobData.salaryMax) {
      throw new BadRequestException(
        'Minimum salary cannot be greater than maximum salary',
      );
    }

    // deadline >= postedDate
    if (jobData.deadline < jobData.postedDate) {
      throw new BadRequestException(
        'Deadline cannot be earlier than posted date',
      );
    }

    // deadline <= postedDate + 1 tháng
    const oneMonthLater = new Date(jobData.postedDate);
    oneMonthLater.setMonth(jobData.postedDate.getMonth() + 1);

    if (jobData.deadline > oneMonthLater) {
      throw new BadRequestException(
        'Deadline cannot be more than 1 month after posted date',
      );
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(JobBenefit)
    private jobBenefitRepository: Repository<JobBenefit>,
  ) {}

  async create(data: CreateJobDto): Promise<JobResponseDto> {
    const { benefits, ...jobData } = data;

    // 1. Tạo job
    const job: Job = this.jobsRepository.create(jobData);
    const savedJob: Job = await this.jobsRepository.save(job);

    // 2. Lưu JobBenefits nếu có
    if (Array.isArray(benefits) && benefits.length > 0) {
      const jobBenefits = benefits.map((benefitId: number) =>
        this.jobBenefitRepository.create({ jobId: savedJob.id, benefitId }),
      );
      await this.jobBenefitRepository.save(jobBenefits);
    }

    // 3. Lấy lại job kèm quan hệ
    const jobWithRelations = await this.jobsRepository.findOne({
      where: { id: savedJob.id },
      relations: ['company'],
    });

    // 4. Lấy danh sách benefit
    jobWithRelations.jobBenefits = await this.jobBenefitRepository.find({
      where: { jobId: savedJob.id },
    });

    // 5. Map sang DTO
    return new JobResponseDto(jobWithRelations);
  }

  async update(id: number, data: CreateJobDto): Promise<JobResponseDto> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    const { benefits, ...jobData } = data;

    // Cập nhật thông tin job
    Object.assign(job, jobData);
    const updatedJob = await this.jobsRepository.save(job);

    // Xoá các jobBenefit cũ
    await this.jobBenefitRepository.delete({ jobId: id });

    // Thêm lại jobBenefits mới nếu có
    if (Array.isArray(benefits)) {
      const jobBenefits = benefits.map((benefitId: number) =>
        this.jobBenefitRepository.create({ jobId: updatedJob.id, benefitId }),
      );
      await this.jobBenefitRepository.save(jobBenefits);
    }

    // Gắn jobBenefits vào object trả về
    updatedJob.jobBenefits = await this.jobBenefitRepository.find({
      where: { jobId: updatedJob.id },
    });

    // Trả về DTO
    return new JobResponseDto(updatedJob);
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
<<<<<<< HEAD


=======
>>>>>>> 6700a0e (Recover work from stash@{0})
    cities.forEach((city, index) => {
      const jobCount = locationMap.get(Number(city)) || 0;
      const image = cityImages[index] || null;
<<<<<<< HEAD
      response.push(new LocationStatsDto(city, jobCount, true, image));

=======
      response.push(
        new LocationStatsDto({
          location: city,
          jobCount: jobCount,
          isMajorCity: true,
          image: image,
        }),
      );
>>>>>>> 6700a0e (Recover work from stash@{0})
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
}

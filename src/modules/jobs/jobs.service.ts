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

  async create(data: CreateJobDto): Promise<Job> {
    const { benefits, ...jobData } = data;
    // Ensure jobData is a single object
    const job: Job = this.jobsRepository.create(jobData);
    const savedJob: Job = await this.jobsRepository.save(job);

    if (Array.isArray(benefits)) {
      const jobBenefits = benefits.map((benefitId: number) =>
        this.jobBenefitRepository.create({ jobId: savedJob.id, benefitId }),
      );
      await this.jobBenefitRepository.save(jobBenefits);
    }

    // Attach jobBenefits for DTOs
    (savedJob as any).jobBenefits = await this.jobBenefitRepository.find({
      where: { jobId: savedJob.id },
    });

    return savedJob;
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
    if (dto.category && dto.category !== ALL_CATEGORIES) {
      where.category = dto.category;
    }
    if (dto.location && dto.location !== ALL_LOCATIONS) {
      where.location = dto.location;
    }
    if (dto.typeOfEmployment?.length > 0) {
      where.typeOfEmployment = In(dto.typeOfEmployment);
    }
    if (dto.experienceLevel?.length > 0) {
      where.experienceLevel = In(dto.experienceLevel);
    }
    if (dto.isFeatured !== undefined || dto.isFeatured !== null) {
      where.isFeatured = dto.isFeatured;
    }

    let jobs: Job[];
    if (Object.keys(where).length === 0) {
      jobs = await this.jobsRepository.find({
        relations: ['company'],
      });
    } else {
      jobs = await this.jobsRepository.find({
        where,
        relations: ['company'],
      });
    }
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
      (item) => new CategoryStatsDto(item.category, parseInt(item.jobCount)),
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

    const locationMap = new Map<string, number>();
    result.forEach((item) => {
      locationMap.set(item.location, parseInt(item.jobCount));
    });

    const response: LocationStatsDto[] = [];


    cities.forEach((city, index) => {
      const jobCount = locationMap.get(city) || 0;
      const image = cityImages[index] || null;
      response.push(new LocationStatsDto(city, jobCount, true, image));

    });

    return response;
  }
}

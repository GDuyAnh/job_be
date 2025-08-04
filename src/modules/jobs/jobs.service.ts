import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Job } from './job.entity';
import { SearchJobDto } from './dto/request/search-job-request.dto';
import { JobDetailDto } from './dto/job-detail.dto';
import { CategoryStatsDto } from './dto/category-stats.dto';
import { LocationStatsDto } from './dto/location-stats.dto';
import { JobResponseDto } from './dto/response/search-job-response.dto';
import { ALL_CATEGORIES, ALL_LOCATIONS, MAJOR_CITIES } from '../constants';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(data: Partial<Job>): Promise<Job> {
    const job = this.jobsRepository.create(data);
    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find();
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async searchJobs(dto: SearchJobDto): Promise<JobResponseDto[]> {
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

    let jobs;
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

    return jobs.map((job) => new JobResponseDto(job));
  }

  async getJobDetail(jobId: number): Promise<JobDetailDto> {
    const job = await this.jobsRepository.findOne({ 
      where: { id: jobId },
      relations: ['company']
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

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

    cities.forEach((city) => {
      const jobCount = locationMap.get(city) || 0;
      response.push(new LocationStatsDto(city, jobCount, true));
    });

    return response;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Job } from './job.entity';
import { SearchJobDto } from './dto/search-job-request.dto';
import { JobDetail } from './job-detail.entity';
import { JobDetailDto } from './dto/job-detail.dto';
import { CategoryStatsDto } from './dto/category-stats.dto';
import { JobResponseDto } from './dto/search-job-response.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(JobDetail)
    private jobDetailRepository: Repository<JobDetail>,
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
    if (dto.category && dto.category !== 'All Categories') {
      where.category = dto.category;
    }
    if (dto.location && dto.location !== 'All Locations') {
      where.location = dto.location;
    }
    if (dto.typeOfEmployment?.length > 0) {
      where.typeOfEmployment = In(dto.typeOfEmployment);
    }
    if (dto.experienceLevel?.length > 0) {
      where.experienceLevel = In(dto.experienceLevel);
    }
    if (dto.isFeatured !== undefined) {
      where.isFeatured = dto.isFeatured;
    }

    let jobs;
    if (Object.keys(where).length === 0) {
      // Không có filter -> lấy toàn bộ jobs + relations
      jobs = await this.jobsRepository.find({
        relations: ['company', 'detail'],
      });
    } else {
      jobs = await this.jobsRepository.find({
        where,
        relations: ['company', 'detail'],
      });
    }

    return jobs.map((job) => new JobResponseDto(job));
  }

  async getJobDetail(jobId: number): Promise<JobDetailDto> {
    const job = await this.jobsRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const detail = await this.jobDetailRepository.findOne({ where: { jobId } });

    return new JobDetailDto(job, detail);
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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Job } from './job.entity';
import { SearchJobDto } from './dto/search-job.dto';

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

  async searchJobs(dto: SearchJobDto): Promise<Job[]> {
    const where: any = {};

    if (dto.keyword && dto.keyword.trim()) {
      where.title = Like(`%${dto.keyword.trim()}%`);
    }

    if (dto.category && dto.category !== 'All Categories') {
      where.category = dto.category;
    }

    if (dto.location && dto.location !== 'All Locations') {
      where.location = dto.location;
    }

    if (dto.typeOfEmployment && dto.typeOfEmployment.length > 0) {
      where.typeOfEmployment = In(dto.typeOfEmployment);
    }

    if (dto.experienceLevel && dto.experienceLevel.length > 0) {
      where.experienceLevel = In(dto.experienceLevel);
    }

    if (Object.keys(where).length === 0) {
      return this.jobsRepository.find();
    }

    return this.jobsRepository.find({ where });
  }
}

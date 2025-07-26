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
    console.log('DTO nhận được:', dto);

    const where: any = {};

    // Keyword: chỉ lọc nếu có
    if (dto.keyword && dto.keyword.trim()) {
      where.title = Like(`%${dto.keyword.trim()}%`);
    }

    // Category: bỏ qua nếu chọn All Categories
    if (dto.category && dto.category !== 'All Categories') {
      where.category = dto.category;
    }

    // Location: bỏ qua nếu chọn All Locations
    if (dto.location && dto.location !== 'All Locations') {
      where.location = dto.location;
    }

    // Nếu có typeOfEmployment
    if (dto.typeOfEmployment) {
      where.typeOfEmployment = In(dto.typeOfEmployment);
    }

    // Nếu có experienceLevel
    if (dto.experienceLevel) {
      where.experienceLevel = In(dto.experienceLevel);
    }

    console.log('WHERE:', where);
    return this.jobsRepository.find({ where });
  }
}

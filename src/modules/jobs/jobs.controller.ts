import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Job created', type: Job })
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List jobs', type: [Job] })
  async findAll(): Promise<Job[]> {
    return this.jobsService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Job detail', type: Job })
  async findOne(@Param('id') id: number): Promise<Job> {
    return this.jobsService.findOne(id);
  }
} 
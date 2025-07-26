import { Controller, Post, Get, Param, Body, Query, Put } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto } from './dto/search-job.dto';
import { JobDetail } from './job-detail.entity';
import { JobDetailDto } from './dto/job-detail.dto';

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

  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'Search Job in Detail',
    type: [Job],
  })
  async searchJobs(@Query() query: SearchJobDto): Promise<Job[]> {
    return this.jobsService.searchJobs(query);
  }

  // @Get(':id')
  // @ApiResponse({ status: 200, description: 'Job detail', type: Job })
  // async findOne(@Param('id') id: number): Promise<Job> {
  //   return this.jobsService.findOne(id);
  // }

  @Get('/detail/:id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết công việc',
    type: JobDetailDto,
  })
  async getJobDetail(@Param('id') id: number): Promise<JobDetailDto> {
    return this.jobsService.getJobDetail(id);
  }

}

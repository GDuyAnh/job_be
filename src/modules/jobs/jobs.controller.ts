import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/request/create-job.dto';
import { SearchJobDto } from './dto/request/search-job-request.dto';
import { JobDetailDto } from './dto/response/job-detail.dto';
import { CategoryStatsDto } from './dto/response/category-stats.dto';
import { LocationStatsDto } from './dto/response/location-stats.dto';
import { JobResponseDto } from './dto/response/job-response.dto';
import { JobSearchResponseDto } from './dto/response/search-job-response.dto';

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
  async findAll(): Promise<JobResponseDto[]> {
    return this.jobsService.findAll();
  }

  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'Search Job in Detail',
    type: [Job],
  })
  async searchJobs(
    @Query() query: SearchJobDto,
  ): Promise<JobSearchResponseDto[]> {
    return this.jobsService.searchJobs(query);
  }

  @Get('categories')
  @ApiResponse({
    status: 200,
    description: 'List of categories and job counts',
    type: [CategoryStatsDto],
  })
  async getCategoriesWithJobCount(): Promise<CategoryStatsDto[]> {
    return this.jobsService.getCategoriesWithJobCount();
  }

  @Get('locations')
  @ApiResponse({
    status: 200,
    description: 'List of locations and job counts',
    type: [LocationStatsDto],
  })
  async getLocationsWithJobCount(): Promise<LocationStatsDto[]> {
    return this.jobsService.getLocationsWithJobCount();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Job details',
    type: JobDetailDto,
  })
  async getJobDetail(@Param('id') id: number): Promise<JobDetailDto> {
    return this.jobsService.getJobDetail(id);
  }
}

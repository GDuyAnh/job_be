import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Put,
  Query,
  Delete,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/request/create-job.dto';
import { SearchJobDto } from './dto/request/search-job-request.dto';
import { JobResponseDto } from './dto/response/job-response.dto';
import { JobSearchResponseDto } from './dto/response/search-job-response.dto';
import { Roles } from '../constants/roles.decorator';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RoleStatus } from '@/enum/role';
import { CategoryStatsDto } from './dto/response/category-stats.dto';
import { LocationStatsDto } from './dto/response/location-stats.dto';
import { JobDetailDto } from './dto/response/job-detail.dto';
import { SearchJobAdminDto } from './dto/request/search-job-request-admin.dto';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.COMPANY, RoleStatus.ADMIN, RoleStatus.USER)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Job created' })
  async create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.COMPANY)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Job updated' })
  async update(@Param('id') id: number, @Body() updateJobDto: CreateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List jobs' })
  async findAll(): Promise<JobResponseDto[]> {
    return this.jobsService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Admin list jobs ( filter by isWaiting )',
  })
  async adminList(@Query() query: SearchJobAdminDto) {
    return this.jobsService.listForAdmin(query);
  }

  @Get('search')
  @ApiResponse({ status: 200, description: 'Search jobs' })
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

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.USER, RoleStatus.COMPANY, RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Get jobs by user ID',
    type: [JobResponseDto],
  })
  async getJobsByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<JobResponseDto[]> {
    return this.jobsService.getJobsByUserId(userId);
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.COMPANY)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Job deleted' })
  async delete(@Param('id') id: number) {
    await this.jobsService.delete(id);
    return { message: `Job with ${id} deleted successfully` };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Job approved successfully',
  })
  async approveJobs(@Param('id', ParseIntPipe) jobId: number) {
    return this.jobsService.approve(jobId);
  }
}

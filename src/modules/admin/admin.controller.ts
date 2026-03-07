import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService, AdminStatsDto } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../constants/roles.decorator';
import { RoleStatus } from '@/enum/role';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard statistics',
    schema: {
      type: 'object',
      properties: {
        companiesCount: { type: 'number' },
        jobsCount: { type: 'number' },
        applicationsCount: { type: 'number' },
        usersCount: { type: 'number' },
      },
    },
  })
  async getStats(): Promise<AdminStatsDto> {
    return this.adminService.getStats();
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List all job applications (admin)',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          jobTitle: { type: 'string' },
          jobId: { type: 'number' },
          companyName: { type: 'string' },
          applicantName: { type: 'string' },
          email: { type: 'string' },
          applicationDate: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getApplications() {
    return this.adminService.getAllApplications();
  }

  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Application soft-deleted' })
  async deleteApplication(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteApplication(id);
    return { message: 'Application deleted successfully' };
  }
}

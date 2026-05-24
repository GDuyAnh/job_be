import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService, AdminStatsDto } from './admin.service';
import { AdminImportService, AdminImportResultDto } from './admin-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../constants/roles.decorator';
import { RoleStatus } from '@/enum/role';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminImportService: AdminImportService,
  ) {}

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

  @Get('import/excel-template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description:
      'Tải mẫu: .xlsx hoặc .xlsm (khi có vbaraw.bin). 5 sheet dữ liệu + note + lists; cột id (công thức) + FK dropdown; macro tùy chọn — xem assets/README-VBA.txt. File tĩnh trong assets (nếu có) có thể lệch phiên bản so với mẫu build động.',
  })
  async getImportExcelTemplate(@Res() res: Response) {
    // Ưu tiên trả về file template tĩnh (đã có macro sẵn) nếu trong dự án có đặt sẵn.
    // Nếu không có, fallback sang build template động như hiện tại.
    const tpl = await this.adminImportService
      .getStaticImportTemplateFile()
      .catch(() => this.adminImportService.buildImportExcelTemplate());
    const { buffer, fileName, contentType } = tpl;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.end(buffer);
  }

  @Post('import/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  @ApiResponse({
    status: 200,
    description:
      'Trước khi import: xóa toàn bộ companies, jobs, job_applications, blogs, job_benefit, company_image và user không phải ADMIN (giữ tài khoản ADMIN). Sau đó import từ Excel — summary + lỗi theo dòng nếu có.',
  })
  @ApiBearerAuth()
  async postImportExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AdminImportResultDto> {
    if (!file?.buffer) {
      throw new BadRequestException('Vui lòng gửi file (field: file)');
    }
    return this.adminImportService.importFromExcelBuffer(file.buffer);
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

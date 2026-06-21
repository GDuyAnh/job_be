import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
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
import { EmailService } from '../email/email.service';
import { EmailSettingsService } from '../email/email-settings.service';
import { EmailTemplateService } from '../email/email-template.service';
import {
  TestEmailSettingsDto,
  UpdateEmailSettingsDto,
} from '../email/dto/update-email-settings.dto';
import { EmailSettingsResponseDto } from '../email/dto/email-settings-response.dto';
import {
  EmailTemplateListItemDto,
  EmailTemplateResponseDto,
} from '../email/dto/email-template-response.dto';
import {
  PreviewEmailTemplateDto,
  UpdateEmailTemplateDto,
} from '../email/dto/update-email-template.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminImportService: AdminImportService,
    private readonly emailSettingsService: EmailSettingsService,
    private readonly emailService: EmailService,
    private readonly emailTemplateService: EmailTemplateService,
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
      'Tải mẫu: ưu tiên file tĩnh assets/mau-import-tuyengiaovien.xlsm (hoặc .xlsx). Không có file tĩnh thì server tự build (có thể gắn VBA qua vbaraw.bin).',
  })
  async getImportExcelTemplate(@Res() res: Response) {
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

  @Get('settings/email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'SMTP email settings (password is never returned)',
    type: EmailSettingsResponseDto,
  })
  async getEmailSettings(): Promise<EmailSettingsResponseDto> {
    return this.emailSettingsService.getAdminSettings();
  }

  @Put('settings/email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Save SMTP email settings to database',
    type: EmailSettingsResponseDto,
  })
  async updateEmailSettings(
    @Body() dto: UpdateEmailSettingsDto,
  ): Promise<EmailSettingsResponseDto> {
    const result = await this.emailSettingsService.updateAdminSettings(dto);
    await this.emailService.reinitializeTransporter();
    return result;
  }

  @Post('settings/email/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Send a test email using active SMTP config' })
  async testEmailSettings(
    @Body() dto: TestEmailSettingsDto,
    @Request() req: { user?: { email?: string } },
  ) {
    const to = dto.to?.trim() || req.user?.email?.trim();

    if (!to) {
      throw new BadRequestException('Không xác định được email nhận thử');
    }

    try {
      await this.emailService.sendTestEmail(to);
      return { message: `Đã gửi email thử tới ${to}` };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Gửi email thử thất bại',
      );
    }
  }

  @Get('settings/email/templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: [EmailTemplateListItemDto] })
  async listEmailTemplates(): Promise<EmailTemplateListItemDto[]> {
    const templates = await this.emailTemplateService.findAll();
    return templates.map((t) => EmailTemplateListItemDto.fromEntity(t));
  }

  @Get('settings/email/templates/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: EmailTemplateResponseDto })
  async getEmailTemplate(
    @Param('code') code: string,
  ): Promise<EmailTemplateResponseDto> {
    const template = await this.emailTemplateService.findByCode(code);
    return EmailTemplateResponseDto.fromEntity(template);
  }

  @Put('settings/email/templates/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: EmailTemplateResponseDto })
  async updateEmailTemplate(
    @Param('code') code: string,
    @Body() dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateResponseDto> {
    const template = await this.emailTemplateService.update(code, dto);
    return EmailTemplateResponseDto.fromEntity(template);
  }

  @Post('settings/email/templates/:code/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: EmailTemplateResponseDto })
  async resetEmailTemplate(
    @Param('code') code: string,
  ): Promise<EmailTemplateResponseDto> {
    const template = await this.emailTemplateService.resetToDefault(code);
    return EmailTemplateResponseDto.fromEntity(template);
  }

  @Post('settings/email/templates/:code/preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Rendered HTML preview' })
  async previewEmailTemplate(
    @Param('code') code: string,
    @Body() dto: PreviewEmailTemplateDto,
  ) {
    const template = await this.emailTemplateService.findByCode(code);
    const sampleVars = this.emailTemplateService.getSampleVariables(code);
    const variables = { ...sampleVars, ...(dto.variables || {}) };
    const rendered = this.emailTemplateService.render(
      code,
      template,
      variables,
    );
    return rendered;
  }
}

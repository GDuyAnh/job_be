import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  BadRequestException,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { SearchCompanyDto } from './dto/search-company.dto';
import { CompanyDetailDto } from './dto/company-detail.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/constants/roles.decorator';
import { RoleStatus } from '@/enum/role';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN, RoleStatus.COMPANY)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: CompanyDetailDto,
  })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  async findAll(): Promise<CompanyResponseDto[]> {
    return this.companiesService.findAll();
  }

  @Get('search')
  async searchCompanies(
    @Query() query: SearchCompanyDto,
  ): Promise<CompanyResponseDto[]> {
    return this.companiesService.searchCompanies(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Company detail information',
    type: CompanyDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyDetail(
    @Param('id') companyId: string,
  ): Promise<CompanyDetailDto> {
    const id = parseInt(companyId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid company ID');
    }
    return this.companiesService.getCompanyDetail(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN, RoleStatus.COMPANY)
  @ApiBearerAuth()
  async updateCompany(
    @Param('id') companyId: string,
    @Body() updateCompanyDto: CreateCompanyDto,
  ) {
    const id = parseInt(companyId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid company ID');
    }
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN, RoleStatus.COMPANY)
  @ApiBearerAuth()
  async deleteCompany(@Param('id', ParseIntPipe) companyId: number) {
    await this.companiesService.delete(companyId);
    return { message: `Company with ${companyId} deleted successfully` };
  }
}

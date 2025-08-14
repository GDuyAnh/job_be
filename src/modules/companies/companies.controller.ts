import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/request/create-company.dto';
import { SearchCompanyDto } from './dto/request/search-company.dto';
import { CompanyDetailDto } from './dto/response/company-detail.dto';
import { CompanyResponseDto } from './dto/response/company-response.dto';
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
    @Param('id', ParseIntPipe) companyId: number,
  ): Promise<CompanyDetailDto> {
    return this.companiesService.getCompanyDetail(companyId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: CompanyDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async updateCompany(
    @Param('id', ParseIntPipe) companyId: number,
    @Body() updateCompanyDto: CreateCompanyDto,
  ) {
    return this.companiesService.update(companyId, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN, RoleStatus.COMPANY)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async deleteCompany(@Param('id', ParseIntPipe) companyId: number) {
    await this.companiesService.delete(companyId);
    return { message: `Company with ID ${companyId} deleted successfully` };
  }
}

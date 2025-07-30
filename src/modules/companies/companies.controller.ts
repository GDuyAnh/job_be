import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { SearchCompanyDto } from './dto/search-company.dto';
import { CompanyDetailDto } from './dto/company-detail.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Company created' })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List companies',
    type: [CompanyResponseDto],
  })
  async findAll(): Promise<CompanyResponseDto[]> {
    return this.companiesService.findAll();
  }

  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'Search Company in Detail',
    type: [CompanyResponseDto],
  })
  async searchCompanies(
    @Query() query: SearchCompanyDto,
  ): Promise<CompanyResponseDto[]> {
    return this.companiesService.searchCompanies(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Chi tiết công ty',
    type: CompanyDetailDto,
  })
  async getCompanyDetail(
    @Param('id') companyId: number,
  ): Promise<CompanyDetailDto> {
    return this.companiesService.getCompanyDetail(companyId);
  }
}

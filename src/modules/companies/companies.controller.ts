import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
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
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - company name or email already exists',
  })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of all companies',
    type: [CompanyResponseDto],
  })
  async findAll(): Promise<CompanyResponseDto[]> {
    return this.companiesService.findAll();
  }

  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'Search companies by organization type',
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
    description: 'Company detail information',
    type: CompanyDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async getCompanyDetail(
    @Param('id') companyId: string,
  ): Promise<CompanyDetailDto> {
    const id = parseInt(companyId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid company ID');
    }
    return this.companiesService.getCompanyDetail(id);
  }
}

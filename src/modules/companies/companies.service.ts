import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { SearchCompanyDto } from './dto/search-company.dto';
import { CompanyDetailDto } from './dto/company-detail.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(data: CreateCompanyDto): Promise<Company> {
    // Check if email is provided
    if (!data.email) {
      throw new BadRequestException('Email is required');
    }

    // Check if company name already exists
    const existingCompany = await this.companiesRepository.findOne({
      where: { name: data.name.trim() }
    });

    if (existingCompany) {
      throw new ConflictException('Company name already exists');
    }

    // Check if email already exists
    const existingEmail = await this.companiesRepository.findOne({
      where: { email: data.email }
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const company = this.companiesRepository.create(data);
    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<CompanyResponseDto[]> {
    const companies = await this.companiesRepository.find();
    return companies.map((company) => new CompanyResponseDto(company));
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companiesRepository.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async searchCompanies(dto: SearchCompanyDto): Promise<CompanyResponseDto[]> {
    const where: any = {};

    if (dto.organizationType && dto.organizationType !== 'Tất cả') {
      where.organizationType = dto.organizationType;
    }

    let companies: Company[];
    if (Object.keys(where).length === 0) {
      companies = await this.companiesRepository.find();
    } else {
      companies = await this.companiesRepository.find({ where });
    }

    return companies.map((company) => new CompanyResponseDto(company));
  }

  async getCompanyDetail(companyId: number): Promise<CompanyDetailDto> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return new CompanyDetailDto(company);
  }
}

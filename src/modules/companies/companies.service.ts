import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { SearchCompanyDto } from './dto/search-company.dto';
import { CompanyDetail } from './company-detail.entity';
import { CompanyDetailDto } from './dto/company-detail.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(CompanyDetail)
    private companyDetailRepository: Repository<CompanyDetail>,
  ) {}

  async create(data: Partial<Company>): Promise<Company> {
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

    const detail = await this.companyDetailRepository.findOne({
      where: { companyId },
    });

    return new CompanyDetailDto(company, detail);
  }
}

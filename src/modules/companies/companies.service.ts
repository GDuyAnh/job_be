import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { SearchCompanyDto } from './dto/search-company.dto';
import { CompanyDetailDto } from './dto/company-detail.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ALL_LOCATIONS, ALL_ORGANIZATION_TYPES } from '../constants';
import { Job } from '../jobs/job.entity';
import { CompanyJobSummaryDto } from './dto/company-job-summary.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,

    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(data: CreateCompanyDto): Promise<Company> {
    if (!data.email) {
      throw new BadRequestException('Email is required');
    }

    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException(
        'Company name is required and cannot be empty',
      );
    }

    const existingCompany = await this.companiesRepository.findOne({
      where: { name: data.name.trim() },
    });

    if (existingCompany) {
      throw new ConflictException('Company name already exists');
    }

    const existingEmail = await this.companiesRepository.findOne({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const company = this.companiesRepository.create(data);
    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<CompanyResponseDto[]> {
    const companies = await this.companiesRepository
      .createQueryBuilder('company')
      .leftJoin('company.jobs', 'job')
      .select('company')
      .addSelect('COUNT(job.id)', 'openPositions')
      .groupBy('company.id')
      .getRawAndEntities();

    return companies.entities.map((company, index) => {
      const count = parseInt(companies.raw[index].openPositions, 10) || 0;
      return new CompanyResponseDto(company, count);
    });
  }

  async searchCompanies(dto: SearchCompanyDto): Promise<CompanyResponseDto[]> {
    const noFilterLocation = !dto.location || dto.location === ALL_LOCATIONS;
    const noFilterOrganizationType =
      !dto.organizationType || dto.organizationType === ALL_ORGANIZATION_TYPES;

    if (
      noFilterLocation &&
      noFilterOrganizationType &&
      dto.isShow === undefined
    ) {
      const companies = await this.companiesRepository
        .createQueryBuilder('company')
        .leftJoin('company.jobs', 'job')
        .select('company')
        .addSelect('COUNT(job.id)', 'openPositions')
        .groupBy('company.id')
        .getRawAndEntities();

      return companies.entities.map((company, index) => {
        const count = parseInt(companies.raw[index].openPositions, 10) || 0;
        return new CompanyResponseDto(company, count);
      });
    }

    const qb = this.companiesRepository
      .createQueryBuilder('company')
      .leftJoin('company.jobs', 'job')
      .select('company')
      .addSelect('COUNT(job.id)', 'openPositions');

    if (!noFilterOrganizationType) {
      qb.andWhere('company.organizationType = :organizationType', {
        organizationType: dto.organizationType,
      });
    }

    if (!noFilterLocation) {
      qb.andWhere('job.location = :location', { location: dto.location });
    }

    if (dto.isShow !== undefined && dto.isShow !== null) {
      qb.andWhere('company.isShow = :isShow', { isShow: dto.isShow });
    }

    qb.groupBy('company.id');

    const companies = await qb.getRawAndEntities();

    return companies.entities.map((company, index) => {
      const count = parseInt(companies.raw[index].openPositions, 10) || 0;
      return new CompanyResponseDto(company, count);
    });
  }

  async getCompanyDetail(companyId: number): Promise<CompanyDetailDto> {
    // 1. Find Company
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // 2. Find all jobs related to company
    const jobs = await this.jobsRepository.find({
      where: { companyId: companyId },
      order: {
        postedDate: 'DESC',
      },
    });

    // 3. Transform jobs into CompanyJobSummaryDto
    const jobSummaries = jobs.map((job) => new CompanyJobSummaryDto(job));

    // 4. Return CompanyDetailDto with Jobs
    return new CompanyDetailDto(company, jobSummaries);
  }

  async update(
    companyId: number,
    data: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException(
        'Company name is required and cannot be empty',
      );
    }

    const existingCompany = await this.companiesRepository.findOne({
      where: { name: data.name.trim() },
    });

    if (existingCompany && existingCompany.id !== companyId) {
      throw new ConflictException('Company name already exists');
    }

    if (!data.email) {
      throw new BadRequestException('Email is required');
    }
    const existingEmail = await this.companiesRepository.findOne({
      where: { email: data.email },
    });

    if (existingEmail && existingEmail.id !== companyId) {
      throw new ConflictException('Email already exists');
    }

    Object.assign(company, data);
    const updated = await this.companiesRepository.save(company);
    return new CompanyResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const company = await this.companiesRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const jobCount = await this.jobsRepository.count({
      where: { companyId: id },
    });
    if (jobCount > 0) {
      throw new BadRequestException('Can not delete company with active jobs');
    }

    await this.companiesRepository.delete(id);
  }
}

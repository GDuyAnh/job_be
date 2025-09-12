import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { SearchCompanyDto } from './dto/request/search-company.dto';
import { CompanyDetailDto } from './dto/response/company-detail.dto';
import { CompanyResponseDto } from './dto/response/company-response.dto';
import { CreateCompanyDto } from './dto/request/create-company.dto';
import { ALL_LOCATIONS, ALL_ORGANIZATION_TYPES } from '../constants';
import { Job } from '../jobs/job.entity';
import { CompanyJobSummaryDto } from './dto/response/company-job-summary.dto';
import { CompanyImage } from './company-image.entity';
import { SearchCompanyAdminDto } from './dto/request/search-company-admin.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { log } from 'console';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,

    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,

    @InjectRepository(CompanyImage)
    private companyImageRepository: Repository<CompanyImage>,
  ) {}

  async create(data: CreateCompanyDto): Promise<CompanyResponseDto> {
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

    const { companyImages, ...companyData } = data;

    companyData.isWaiting = true;

    const company = this.companiesRepository.create(companyData);
    const savedCompany = await this.companiesRepository.save(company);

    if (companyImages && companyImages.length > 0) {
      const images = companyImages.map((imageDto) => {
        return this.companyImageRepository.create({
          url: imageDto.url,
          company: savedCompany,
        });
      });
      await this.companyImageRepository.save(images);
      savedCompany.companyImages = images;
    }

    return new CompanyResponseDto(savedCompany);
  }

  async searchCompanies(dto: SearchCompanyDto): Promise<CompanyResponseDto[]> {
    const noFilterKeyword = !dto.keyword?.trim();
    const noFilterLocation = !dto.location || dto.location === ALL_LOCATIONS;
    const noFilterOrganizationType =
      !dto.organizationType || dto.organizationType === ALL_ORGANIZATION_TYPES;

    if (
      noFilterKeyword &&
      noFilterLocation &&
      noFilterOrganizationType &&
      dto.isShow === undefined
    ) {
      const companies = await this.companiesRepository
        .createQueryBuilder('company')
        .leftJoin('company.jobs', 'job')
        .select('company')
        .addSelect('COUNT(job.id)', 'openPositions')
        .where('company.IsWaiting =:w', { w: false })
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

    if (!noFilterKeyword) {
      qb.andWhere('LOWER(company.name) LIKE LOWER(:keyword)', {
        keyword: `%${dto.keyword.trim()}%`,
      });
    }

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
    // 1. Find Company với relations companyImages
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['companyImages'],
    });

    if (!company || company.isWaiting) {
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

    // 4. Return CompanyDetailDto with Jobs and Images
    return new CompanyDetailDto(company, jobSummaries);
  }

  async getCompanyDetailByMst(mst: number): Promise<CompanyDetailDto> {
    // 1. Find company based on MST + Company Image
    const company = await this.companiesRepository.findOne({
      where: { mst },
      relations: ['companyImages'],
    });
    console.log('Company', company);

    if (!company || company.isWaiting) {
      throw new NotFoundException('Company not found');
    }

    // 2. Find all jobs related to company
    const jobs = await this.jobsRepository.find({
      where: { companyId: company.id },
      order: {
        postedDate: 'DESC',
      },
    });

    // 3. Transform jobs into CompanyJobSummaryDto
    const jobSummaries = jobs.map((job) => new CompanyJobSummaryDto(job));

    return new CompanyDetailDto(company, jobSummaries);
  }

  async update(
    companyId: number,
    data: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['companyImages'],
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

    const { companyImages, ...companyData } = data;

  
    Object.assign(company, companyData);
    const updated = await this.companiesRepository.save(company);

    if (companyImages !== undefined) {
      if (company.companyImages && company.companyImages.length > 0) {
        await this.companyImageRepository.remove(company.companyImages);
      }

      if (companyImages.length > 0) {
        const newImages = companyImages.map((imageDto) => {
          return this.companyImageRepository.create({
            url: imageDto.url,
            company: updated,
          });
        });

        await this.companyImageRepository.save(newImages);
        updated.companyImages = newImages;
      }
    }

    return new CompanyResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['companyImages'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const jobCount = await this.jobsRepository.count({
      where: { companyId: id },
    });

    if (jobCount > 0) {
      throw new BadRequestException('Can not delete company with active jobs');
    }

    // Xóa company images trước (cascade sẽ tự động xóa nhưng để chắc chắn)
    if (company.companyImages && company.companyImages.length > 0) {
      await this.companyImageRepository.remove(company.companyImages);
    }

    await this.companiesRepository.delete(id);
  }

  async listForAdmin(
    dto: SearchCompanyAdminDto,
  ): Promise<CompanyResponseDto[]> {
    const noFilterKeyword = !dto.keyword?.trim();
    const noFilterLocation = !dto.location || dto.location === ALL_LOCATIONS;
    const noFilterOrganizationType =
      !dto.organizationType || dto.organizationType === ALL_ORGANIZATION_TYPES;

    const qb = this.companiesRepository
      .createQueryBuilder('company')
      .leftJoin('company.jobs', 'job')
      .select('company')
      .addSelect('COUNT(job.id)', 'openPositions');

    if (!noFilterKeyword) {
      qb.andWhere('LOWER(company.name) LIKE LOWER(:keyword)', {
        keyword: `%${dto.keyword.trim()}%`,
      });
    }

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

    if (typeof dto.isWaiting === 'boolean') {
      qb.andWhere('company.isWaiting = :w', { w: dto.isWaiting });
    }

    qb.groupBy('company.id');

    const companies = await qb.getRawAndEntities();

    return companies.entities.map((company, index) => {
      const count = parseInt(companies.raw[index].openPositions, 10) || 0;
      return new CompanyResponseDto(company, count);
    });
  }

  async approve(companyId: number): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['companyImages'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.isWaiting = false;
    const updatedCompany = await this.companiesRepository.save(company);
    return new CompanyResponseDto(updatedCompany);
  }
}

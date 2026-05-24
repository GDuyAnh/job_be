import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleStatus } from '@/enum/role';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
import { JobApplication } from '../jobs/job-application.entity';
import { JobApplicationResponseDto } from './dto/response/job-application-response.dto';
import { User } from '../users/user.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,

    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,

    @InjectRepository(CompanyImage)
    private companyImageRepository: Repository<CompanyImage>,

    @InjectRepository(JobApplication)
    private jobApplicationRepository: Repository<JobApplication>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private uploadService: UploadService,
  ) {}

  async create(data: CreateCompanyDto): Promise<CompanyResponseDto> {
    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException(
        'Tên công ty là bắt buộc và không được để trống',
      );
    }

    if (!data.logo || data.logo.trim() === '') {
      throw new BadRequestException(
        'Logo công ty là bắt buộc và không được để trống',
      );
    }

    // Mã số thuế không được để trống when creating a new company
    if (!data.mst || data.mst.trim() === '') {
      throw new BadRequestException('Mã số thuế là bắt buộc và không được để trống');
    }

    const existingCompany = await this.companiesRepository.findOne({
      where: { name: data.name.trim() },
    });

    if (existingCompany) {
      throw new ConflictException('Tên công ty đã tồn tại');
    }

    const { companyImages, mst, ...companyData } = data;

    // Set isWaiting = true by default (requires admin approval)
    companyData.isWaiting = true;

    const company = this.companiesRepository.create({
      ...companyData,
      mst: mst.trim(), // Assign MST explicitly
    });
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

    if (noFilterKeyword && noFilterLocation && noFilterOrganizationType) {
      const companies = await this.companiesRepository
        .createQueryBuilder('company')
        .leftJoin('company.jobs', 'job', "job.status = 'APPROVED'")
        .leftJoin('company.companyImages', 'companyImages') // ✅ chỉ join, không select
        .select('company')
        .addSelect('COUNT(job.id)', 'openPositions')
        .where('company.isWaiting = :isWaiting', { isWaiting: false })
        .groupBy('company.id')
        .getRawAndEntities();

      // Load companyImages riêng cho từng company
      const companyIds = companies.entities.map((company) => company.id);
      const companyImagesMap = new Map<number, any[]>();

      if (companyIds.length > 0) {
        const companyImages = await this.companiesRepository
          .createQueryBuilder('company')
          .leftJoinAndSelect('company.companyImages', 'companyImages')
          .where('company.id IN (:...ids)', { ids: companyIds })
          .getMany();

        companyImages.forEach((company) => {
          companyImagesMap.set(company.id, company.companyImages || []);
        });
      }

      return companies.entities.map((company, index) => {
        const count = parseInt(companies.raw[index].openPositions, 10) || 0;
        // Gán companyImages từ map
        company.companyImages = companyImagesMap.get(company.id) || [];
        return new CompanyResponseDto(company, count);
      });
    }

    const qb = this.companiesRepository
      .createQueryBuilder('company')
      .leftJoin('company.jobs', 'job', "job.status = 'APPROVED'")
      .leftJoin('company.companyImages', 'companyImages') // ✅ chỉ join, không select
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
      // Use LIKE to find location in comma-separated string
      // Match: exact match, start, middle, or end of string
      qb.andWhere(
        '(job.location = :location OR job.location LIKE :locationStart OR job.location LIKE :locationMiddle OR job.location LIKE :locationEnd)',
        {
          location: String(dto.location),
          locationStart: `${dto.location},%`,
          locationMiddle: `%,${dto.location},%`,
          locationEnd: `%,${dto.location}`,
        },
      );
    }

    // Filter out companies waiting for approval (for public search)
    qb.andWhere('company.isWaiting = :isWaiting', { isWaiting: false });

    qb.groupBy('company.id');

    const companies = await qb.getRawAndEntities();

    // Load companyImages riêng cho từng company
    const companyIds = companies.entities.map((company) => company.id);
    const companyImagesMap = new Map<number, any[]>();

    if (companyIds.length > 0) {
      const companyImages = await this.companiesRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.companyImages', 'companyImages')
        .where('company.id IN (:...ids)', { ids: companyIds })
        .getMany();

      companyImages.forEach((company) => {
        companyImagesMap.set(company.id, company.companyImages || []);
      });
    }

    return companies.entities.map((company, index) => {
      const count = parseInt(companies.raw[index].openPositions, 10) || 0;
      // Gán companyImages từ map
      company.companyImages = companyImagesMap.get(company.id) || [];
      return new CompanyResponseDto(company, count);
    });
  }

  async getCompanyDetail(
    companyId: number,
    user?: any,
  ): Promise<CompanyDetailDto> {
    // 1. Find Company với relations companyImages
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['companyImages'],
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    // Check if user can view this company
    // ADMIN can view all companies
    // COMPANY role can only view their own company (even if not approved)
    // Others (including no user) can only view approved and visible companies
    const isAdmin = user?.role === RoleStatus.ADMIN;
    const isOwner =
      user?.role === RoleStatus.COMPANY && user?.companyId === companyId;

    if (!isAdmin && !isOwner) {
      // Only show approved companies to public
      if (company.isWaiting) {
        throw new NotFoundException('Không tìm thấy công ty');
      }
    }

    // 2. Find all approved jobs related to company (for public view)
    // But if user is owner/admin, show all their jobs
    const jobs = await this.jobsRepository.find({
      where: {
        companyId: companyId,
        status: 'APPROVED',
      },
      order: {
        postedDate: 'DESC',
      },
    });

    // 3. Transform jobs into CompanyJobSummaryDto
    const jobSummaries = jobs.map((job) => new CompanyJobSummaryDto(job));

    // 4. Return CompanyDetailDto with Jobs and Images
    return new CompanyDetailDto(company, jobSummaries);
  }

  async getCompanyDetailForAdmin(companyId: number): Promise<CompanyDetailDto> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['companyImages'],
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    const jobs = await this.jobsRepository.find({
      where: { companyId },
      order: { postedDate: 'DESC' },
    });

    const jobSummaries = jobs.map((job) => new CompanyJobSummaryDto(job));
    return new CompanyDetailDto(company, jobSummaries);
  }

  async getCompanyDetailByMst(mst: string): Promise<CompanyDetailDto> {
    // 1. Find company based on MST + Company Image
    const company = await this.companiesRepository.findOne({
      where: { mst },
      relations: ['companyImages'],
    });
    console.log('Company', company);

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    // 2. Find all approved jobs related to company
    const jobs = await this.jobsRepository.find({
      where: {
        companyId: company.id,
        status: 'APPROVED',
      },
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
    user?: any,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['companyImages'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} Không tìm thấy`);
    }

    // Authorization check
    // ADMIN can update any company
    // COMPANY can only update their own company if they are the host
    const isAdmin = user?.role === RoleStatus.ADMIN;
    const isHostCompany =
      user?.role === RoleStatus.COMPANY &&
      user?.isHostCompany === true &&
      user?.companyId === companyId;

    if (!isAdmin && !isHostCompany) {
      throw new UnauthorizedException(
        'Bạn không có quyền chỉnh sửa thông tin công ty này',
      );
    }

    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException(
        'Tên công ty là bắt buộc và không được để trống',
      );
    }

    const existingCompany = await this.companiesRepository.findOne({
      where: { name: data.name.trim() },
    });

    if (existingCompany && existingCompany.id !== companyId) {
      throw new ConflictException('Tên công ty đã tồn tại');
    }

    // Destructure and handle MST separately to prevent data loss
    // MST, logo, and companyImages are extracted separately, so companyData won't contain them
    const { companyImages, logo, mst, ...companyData } = data;

    // Handle MST separately - preserve existing MST if not provided or empty
    if (mst !== undefined && mst !== null && mst.trim() !== '') {
      // MST is provided and has value - update it
      company.mst = mst.trim();
    }
    // If MST is not provided or is empty, keep existing MST (don't modify company.mst)

    // Only update logo if provided (và xóa logo cũ trên R2 nếu thay đổi)
    const prevLogo = company.logo || null;
    if (logo !== undefined) {
      if (!logo || logo.trim() === '') {
        throw new BadRequestException('Logo là bắt buộc và không được để trống');
      }
      company.logo = logo.trim();
    }

    // Xóa banner cũ nếu thay đổi
    const prevBanner = company.bannerImage || null;
    const nextBanner =
      (companyData as any).bannerImage !== undefined ? ((companyData as any).bannerImage ?? null) : undefined;

    // Update other fields (MST is already handled above, so it won't be overwritten)
    Object.assign(company, companyData);
    const updated = await this.companiesRepository.save(company);

    if (companyImages !== undefined) {
      const prevImages = (company.companyImages || []).map((i) => i.url).filter(Boolean);
      const nextImages = (companyImages || []).map((i: any) => i?.url).filter(Boolean);

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

      // Best-effort: xóa các ảnh cũ không còn dùng trên R2
      const removed = prevImages.filter((u) => !nextImages.includes(u));
      if (removed.length > 0) {
        this.uploadService.deleteBatch(removed).catch((e) => console.error('R2 delete (companyImages) failed:', e));
      }
    }

    // Best-effort: xóa logo/banner cũ nếu đã đổi
    if (prevLogo && updated.logo && prevLogo !== updated.logo) {
      this.uploadService.deleteFile(prevLogo).catch((e) => console.error('R2 delete (company logo) failed:', e));
    }
    if (prevBanner && (updated.bannerImage || null) !== prevBanner) {
      this.uploadService.deleteFile(prevBanner).catch((e) => console.error('R2 delete (company banner) failed:', e));
    }

    return new CompanyResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['companyImages'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} Không tìm thấy`);
    }

    const jobCount = await this.jobsRepository.count({
      where: { companyId: id },
    });

    if (jobCount > 0) {
      throw new BadRequestException('Không thể xóa công ty đang có tin tuyển dụng hoạt động');
    }

    // Best-effort: xóa file trên R2 trước khi xóa record
    const urlsToDelete: string[] = [];
    if (company.logo) urlsToDelete.push(company.logo);
    if (company.bannerImage) urlsToDelete.push(company.bannerImage);
    if (company.companyImages?.length) {
      urlsToDelete.push(...company.companyImages.map((i) => i.url).filter(Boolean));
    }
    if (urlsToDelete.length > 0) {
      this.uploadService.deleteBatch(urlsToDelete).catch((e) => console.error('R2 delete (company) failed:', e));
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
      const kw = `%${dto.keyword.trim()}%`;
      qb.andWhere(
        '(LOWER(company.name) LIKE LOWER(:keyword) OR company.mst LIKE :keyword OR LOWER(company.email) LIKE LOWER(:keyword))',
        { keyword: kw },
      );
    }

    if (!noFilterOrganizationType) {
      qb.andWhere('company.organizationType = :organizationType', {
        organizationType: dto.organizationType,
      });
    }

    if (!noFilterLocation) {
      // Use LIKE to find location in comma-separated string
      // Match: exact match, start, middle, or end of string
      qb.andWhere(
        '(job.location = :location OR job.location LIKE :locationStart OR job.location LIKE :locationMiddle OR job.location LIKE :locationEnd)',
        {
          location: String(dto.location),
          locationStart: `${dto.location},%`,
          locationMiddle: `%,${dto.location},%`,
          locationEnd: `%,${dto.location}`,
        },
      );
    }

    if (typeof dto.isWaiting === 'boolean') {
      qb.andWhere('company.isWaiting = :w', { w: dto.isWaiting });
    }

    // isFeatured / hasBanner come as query strings 'true' | 'false'
    const isFeaturedFilter = dto.isFeatured === 'true';
    const hasBannerFilter = dto.hasBanner === 'true';

    if (isFeaturedFilter) {
      qb.andWhere('company.isFeatured = :isFeatured', {
        isFeatured: true,
      });
    }

    if (hasBannerFilter) {
      qb.andWhere(
        'company.bannerImage IS NOT NULL AND company.bannerImage != :empty',
        { empty: '' },
      );
    }

    qb.groupBy('company.id');

    const companies = await qb.getRawAndEntities();

    const companyIds = companies.entities.map((c) => c.id);
    const creatorByCompanyId = new Map<
      number,
      { email: string | null; phoneNumber: string | null }
    >();
    const companyImagesMap = new Map<number, any[]>();

    if (companyIds.length > 0) {
      const [users, companiesWithImages] = await Promise.all([
        this.usersRepository.find({
          where: { companyId: In(companyIds) },
          order: { id: 'ASC' },
        }),
        this.companiesRepository
          .createQueryBuilder('company')
          .leftJoinAndSelect('company.companyImages', 'companyImages')
          .where('company.id IN (:...ids)', { ids: companyIds })
          .getMany(),
      ]);

      for (const u of users) {
        if (u.companyId != null && !creatorByCompanyId.has(u.companyId)) {
          const phone = u.phoneNumber?.trim() || null;
          creatorByCompanyId.set(u.companyId, {
            email: u.email ?? null,
            phoneNumber: phone,
          });
        }
      }
      companiesWithImages.forEach((c) => {
        companyImagesMap.set(c.id, c.companyImages || []);
      });
    }

    return companies.entities.map((company, index) => {
      const count = parseInt(companies.raw[index].openPositions, 10) || 0;
      const creator = creatorByCompanyId.get(company.id);
      company.companyImages = companyImagesMap.get(company.id) || [];
      return new CompanyResponseDto(company, count, creator);
    });
  }

  async approve(companyId: number): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['companyImages'],
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    // Approve company: set isWaiting = false
    company.isWaiting = false;
    const updatedCompany = await this.companiesRepository.save(company);
    return new CompanyResponseDto(updatedCompany);
  }

  async getApplicationsByJobOwner(
    userId: number,
  ): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.user', 'user')
      .where('job.userId = :userId', { userId })
      .orderBy('application.appliedAt', 'DESC')
      .getMany();

    return applications.map((app) => {
      return new JobApplicationResponseDto({
        id: app.id,
        jobTitle: app.job.title,
        jobId: app.job.id,
        applicantName: app.user.fullName,
        phone: app.user.phoneNumber || '',
        email: app.user.email,
        cvUrl: app.resumePath || undefined,
        coverLetterText: app.coverLetterText || undefined,
        applicationDate: app.appliedAt,
      });
    });
  }

  async setFeatured(
    companyId: number,
    isFeatured: boolean,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['companyImages'],
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    company.isFeatured = isFeatured;
    const updatedCompany = await this.companiesRepository.save(company);

    return new CompanyResponseDto(updatedCompany);
  }

  async createCompanyForRegistration(
    taxCode: string,
    email: string,
  ): Promise<Company> {
    // Tạo company đơn giản khi đăng ký làm nhà tuyển dụng
    // Sử dụng tên công ty mặc định từ email
    const companyName = email.split('@')[0] + ' Company';

    const company = this.companiesRepository.create({
      name: companyName,
      mst: taxCode.trim(),
      logo: 'https://via.placeholder.com/150', // Logo mặc định
      address: '',
      organizationType: 1, // Mặc định là loại hình đầu tiên
      isWaiting: true, // Cần admin duyệt
    });

    return await this.companiesRepository.save(company);
  }
}

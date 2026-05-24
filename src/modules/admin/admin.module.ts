import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Company } from '../companies/company.entity';
import { Job } from '../jobs/job.entity';
import { JobApplication } from '../jobs/job-application.entity';
import { User } from '../users/user.entity';
import { Blog } from '../blogs/blog.entity';
import { JobBenefit } from '../jobs/job-benefit.entity';
import { CompanyImage } from '../companies/company-image.entity';
import { AdminImportService } from './admin-import.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      CompanyImage,
      Job,
      JobApplication,
      JobBenefit,
      User,
      Blog,
    ]),
    UploadModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminImportService],
  exports: [AdminService, AdminImportService],
})
export class AdminModule {}

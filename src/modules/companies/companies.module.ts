import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Job } from '../jobs/job.entity';
import { CompanyImage } from './company-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Job, CompanyImage])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobBenefit } from './job-benefit.entity';
import { Company } from '../companies/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, JobBenefit, Company])],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}

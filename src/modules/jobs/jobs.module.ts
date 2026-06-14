import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobBenefit } from './job-benefit.entity';
import { Company } from '../companies/company.entity';
import { JobApplication } from './job-application.entity';
import { UsersModule } from '../users/users.module';
import { PublicJobsController } from './public-jobs.controller';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobBenefit, Company, JobApplication, User]),
    UsersModule,
    AuthModule,
    UploadModule,
    EmailModule,
  ],
  controllers: [JobsController, PublicJobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}

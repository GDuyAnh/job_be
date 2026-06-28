import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import {
  AuthModule,
  UsersModule,
  DemoModule,
  JobsModule,
  CompaniesModule,
  BlogsModule,
  UploadModule,
  AdminModule,
  ContactModule,
} from '@/modules';
import { LoggerMiddleware } from '@common/middleware/logger.middleware';
import appConfig from '@/config/app.config';
import emailConfig from '@/config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, emailConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      // ssl: {
      //   ca: process.env.DB_SSL_CA,
      //   rejectUnauthorized: true,
      // },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    DemoModule,
    JobsModule,
    CompaniesModule,
    BlogsModule,
    UploadModule,
    AdminModule,
    ContactModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // apply to all routes
  }
}

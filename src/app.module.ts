import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UsersModule, DemoModule, JobsModule, CompaniesModule, BlogsModule } from '@/modules';
import { LoggerMiddleware } from '@common/middleware/logger.middleware';
import appConfig from '@/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      ssl: {
        ca: process.env.DB_SSL_CA,
        rejectUnauthorized: true,
      },
    }),
    AuthModule,
    UsersModule,
    DemoModule,
    JobsModule,
    CompaniesModule,
    BlogsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // apply to all routes
  }
}

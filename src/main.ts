import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    bodyParser: false, // Disable default body parser to use custom configuration
  });

  // Configure body parser with increased limit BEFORE any other middleware
  // This must be done before setGlobalPrefix and other configurations
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors();

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptor for logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Auth API')
    .setDescription('API with authentication system using NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8081;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Application is running at: http://localhost:${port}`);
  logger.log(`📚 Swagger UI: http://localhost:${port}/api`);
  logger.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
  logger.log(`📊 Logging middleware is activated`);
}

bootstrap();

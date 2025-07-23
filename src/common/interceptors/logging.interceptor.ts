import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap((_data) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const statusCode = response.statusCode;

        // Log successful response
        this.logger.log(
          `📤 ${method} ${url} - ${statusCode} - ${responseTime}ms`,
          'LoggingInterceptor',
        );

        // Log slow requests (> 1000ms)
        if (responseTime > 1000) {
          this.logger.warn(
            `🐌 Slow Request: ${method} ${url} took ${responseTime}ms`,
            'LoggingInterceptor',
          );
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Log error
        this.logger.error(
          `❌ ${method} ${url} - ${error.status || 500} - ${responseTime}ms - ${error.message}`,
          error.stack,
          'LoggingInterceptor',
        );

        throw error;
      }),
    );
  }
}

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as moment from 'moment';

export interface LogData {
  timestamp: string;
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent: string;
  ip: string;
  userId?: string;
  token?: string;
  requestBody?: any;
  responseBody?: any;
  error?: string;
  user?: any;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly sensitiveFields = [
    'password',
    'token',
    'authorization',
    'secret',
  ];

  use(request: Request, response: Response, next: NextFunction): void {
    const startTime = process.hrtime();
    const requestId = this.generateRequestId();

    // get request information
    const logData: LogData = {
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      method: request.method,
      url: request.originalUrl,
      userAgent: request.get('user-agent') || 'Unknown',
      ip: this.getClientIp(request),
      token: this.extractToken(request),
      requestBody: this.sanitizeData(request.body),
    };

    // Log request
    this.logRequest(logData, requestId);

    // Override response methods để capture response
    const originalSend = response.send;
    const originalJson = response.json;
    let responseBody: any = {};

    response.send = function (body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    response.json = function (body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // Capture response
    response.on('finish', () => {
      const endTime = process.hrtime(startTime);
      const responseTime = endTime[0] * 1000 + endTime[1] / 1000000;

      const responseLogData: LogData = {
        ...logData,
        statusCode: response.statusCode,
        responseTime: Math.round(responseTime),
        responseBody: this.sanitizeData(responseBody),
      };

      this.logResponse(responseLogData, requestId);
    });

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'Unknown'
    );
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // only show 10 characters at the beginning and end of the token
      return token.length > 20
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : '***';
    }
    return null;
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    for (const field of this.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    }

    // Sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  private logRequest(logData: LogData, requestId: string): void {

    // use different colors for different methods
    const methodColor = this.getMethodColor(logData.method);

    this.logger.log(
      `🚀 ${methodColor}${logData.method}${'\x1b[0m'} ${logData.url} - ${logData.ip} - ${requestId}`,
      'LoggerMiddleware',
    );

    // Log detailed if there is body
    if (logData.requestBody && Object.keys(logData.requestBody).length > 0) {
      this.logger.debug(
        `📤 Request Body: ${JSON.stringify(logData.requestBody, null, 2)}`,
        'LoggerMiddleware',
      );
    }
  }

  private logResponse(logData: LogData, requestId: string): void {
    const statusColor = this.getStatusColor(logData.statusCode || 0);
    const methodColor = this.getMethodColor(logData.method);

    const logMessage = `✅ ${methodColor}${logData.method}${'\x1b[0m'} ${logData.url} - ${statusColor}${logData.statusCode}${'\x1b[0m'} - ${logData.responseTime}ms - ${requestId}`;

    // Log level based on status code
    if (logData.statusCode && logData.statusCode >= 400) {
      this.logger.error(logMessage, 'LoggerMiddleware');

      // Log error details
      if (logData.responseBody && logData.responseBody.message) {
        this.logger.error(
          `❌ Error: ${logData.responseBody.message}`,
          'LoggerMiddleware',
        );
      }
    } else if (logData.statusCode && logData.statusCode >= 300) {
      this.logger.warn(logMessage, 'LoggerMiddleware');
    } else {
      this.logger.log(logMessage, 'LoggerMiddleware');
    }
  }

  private formatLogMessage(
    type: string,
    logData: LogData,
    requestId: string,
  ): string {
    return `[${requestId}] ${type} ${logData.method} ${logData.url} - ${logData.statusCode || 'PENDING'} - ${logData.responseTime || 0}ms`;
  }

  private getMethodColor(method: string): string {
    const colors = {
      GET: '\x1b[32m', // Green
      POST: '\x1b[34m', // Blue
      PUT: '\x1b[33m', // Yellow
      DELETE: '\x1b[31m', // Red
      PATCH: '\x1b[35m', // Magenta
    };
    return colors[method] || '\x1b[37m'; // White for unknown methods
  }

  private getStatusColor(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '\x1b[32m'; // Green
    if (statusCode >= 300 && statusCode < 400) return '\x1b[33m'; // Yellow
    if (statusCode >= 400 && statusCode < 500) return '\x1b[31m'; // Red
    if (statusCode >= 500) return '\x1b[35m'; // Magenta
    return '\x1b[37m'; // White
  }
}

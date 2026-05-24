import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { translateValidationMessage } from '@common/utils/translate-validation-message';

function translatePayload(payload: unknown): unknown {
  if (typeof payload === 'string') {
    return translateValidationMessage(payload);
  }

  if (Array.isArray(payload)) {
    return payload.map((item) =>
      typeof item === 'string' ? translateValidationMessage(item) : item,
    );
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const next = { ...obj };

    if (typeof next.message === 'string') {
      next.message = translateValidationMessage(next.message);
    } else if (Array.isArray(next.message)) {
      next.message = next.message.map((item) =>
        typeof item === 'string' ? translateValidationMessage(item) : item,
      );
    }

    return next;
  }

  return payload;
}

@Catch(HttpException)
export class TranslateExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const raw = exception.getResponse();
    const body = translatePayload(raw);

    response.status(status).json(body);
  }
}

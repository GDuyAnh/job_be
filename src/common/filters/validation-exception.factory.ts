import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { translateValidationMessage } from '@common/utils/translate-validation-message';

function collectMessages(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      for (const msg of Object.values(error.constraints)) {
        messages.push(translateValidationMessage(msg, error.property));
      }
    }
    if (error.children?.length) {
      messages.push(...collectMessages(error.children));
    }
  }

  return messages;
}

export function validationExceptionFactory(errors: ValidationError[]) {
  const messages = collectMessages(errors);
  return new BadRequestException(messages.length ? messages : ['Dữ liệu không hợp lệ']);
}

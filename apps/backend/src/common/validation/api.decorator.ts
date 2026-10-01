// api-result.decorator.ts
import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import type { ApiMessage } from '@test/shared';
import { ApiErrorEnvelopeResponse } from '@/common/response/swagger-response.decorator.js';
import { ResponseMessage } from '@/common/response/response-message.decorator.js';

export function ApiResult(statusCode: number, message: ApiMessage) {
  const swaggerResponse =
    statusCode >= 400
      ? ApiErrorEnvelopeResponse(statusCode, message)
      : ApiResponse({
          status: statusCode,
          description: message.zh,
        });

  if (statusCode >= 200 && statusCode < 300) {
    return applyDecorators(
      HttpCode(statusCode),
      ResponseMessage(message),
      swaggerResponse,
    );
  }

  return swaggerResponse;
}

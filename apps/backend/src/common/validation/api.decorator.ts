// api-result.decorator.ts
import {
  applyDecorators,
  HttpCode,
  SetMetadata,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import type { ApiMessage } from '@test/shared';

// 保留這個 key，讓現有回應攔截器繼續讀取。
export const SUCCESS_MESSAGE_KEY = 'response:success-message';

export function ApiResult(
  statusCode: number,
  message: ApiMessage,
) {
  const swaggerResponse = ApiResponse({
    status: statusCode,
    description: message.zh,
  });

  if (statusCode >= 200 && statusCode < 300) {
    return applyDecorators(
      HttpCode(statusCode),
      SetMetadata(SUCCESS_MESSAGE_KEY, message),
      swaggerResponse,
    );
  }

  return swaggerResponse;
}
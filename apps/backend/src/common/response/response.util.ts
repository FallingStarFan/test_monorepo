import type { ApiMessage, ApiResponse } from '@test/shared';

export function ApiResponse<T>(
  statusCode: number,
  message: ApiMessage,
  data: T,
): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
  };
}

import type { ApiMessage, ApiResponse } from './api-response.js';

export function successResponse<T>(
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

export function errorResponse(
  statusCode: number,
  message: ApiMessage,
): ApiResponse<null> {
  return {
    statusCode,
    message,
    data: null,
  };
}
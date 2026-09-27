import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { map, type Observable } from 'rxjs';

import type { ApiResponse } from '@test/shared';

function normalizeJson(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeJson);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeJson(item)]),
    );
  }

  return value;
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== 'object') return false;
  const body = value as Partial<ApiResponse<unknown>>;
  return (
    typeof body.statusCode === 'number' &&
    Boolean(body.message) &&
    'data' in body
  );
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((value: unknown) => {
        // Controllers using @Res() own redirects/streaming and must not be wrapped.
        if (response.headersSent || value === response) return value;

        if (isApiResponse(value)) return normalizeJson(value);

        return {
          statusCode: response.statusCode,
          message: {
            en: 'Request successful',
            zh: '請求成功',
          },
          data: normalizeJson(value ?? null),
        } satisfies ApiResponse<unknown>;
      }),
    );
  }
}

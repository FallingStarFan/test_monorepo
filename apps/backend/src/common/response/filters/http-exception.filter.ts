// http-exception.filter.ts
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type {
  ApiFieldError,
  ApiMessage,
  ApiResponse,
} from '@test/shared';

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isFieldError(value: unknown): value is ApiFieldError {
  return (
    isRecord(value) &&
    typeof value.field === 'string' &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  );
}

const DEFAULT_MESSAGES: Partial<Record<number, ApiMessage>> = {
  400: { en: 'Bad request', zh: '請求資料錯誤' },
  401: { en: 'Authentication is required', zh: '需要登入驗證' },
  403: { en: 'Forbidden', zh: '沒有權限執行此操作' },
  404: { en: 'Resource not found', zh: '找不到指定資源' },
  409: { en: 'Conflict', zh: '資料發生衝突' },
  422: { en: 'Unprocessable entity', zh: '資料驗證失敗' },
  429: { en: 'Too many requests', zh: '請求次數過多' },
  500: { en: 'Internal server error', zh: '伺服器內部錯誤' },
  502: { en: 'Bad gateway', zh: '上游伺服器錯誤' },
  503: { en: 'Service unavailable', zh: '服務暫時無法使用' },
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      this.logger.error(
        `${request.method} ${request.url} → ${statusCode}`,
        JSON.stringify(exception.getResponse()),
      );
    } else {
      this.logger.error(
        `Unhandled exception: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const exceptionBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : undefined;

    const message = this.getMessage(exceptionBody, statusCode);
    const code =
      isRecord(exceptionBody) && typeof exceptionBody.code === 'string'
        ? exceptionBody.code
        : undefined;

    // 非 HttpException 的內部錯誤，不把細節回傳給前端。
    const errors = this.getErrors(exceptionBody);

    const result: ApiResponse = {
      statusCode,
      message,
      data: null,
      ...(code !== undefined ? { code } : {}),
      ...(errors !== undefined ? { errors } : {}),
    };

    response.status(statusCode).json(result);
  }

  private getMessage(body: unknown, statusCode: number): ApiMessage {
    if (isRecord(body) && isRecord(body.message)) {
      const { en, zh } = body.message;

      if (typeof en === 'string' && typeof zh === 'string') {
        return { en, zh };
      }
    }

    return (
      DEFAULT_MESSAGES[statusCode] ?? {
        en: 'Request failed',
        zh: '請求失敗',
      }
    );
  }

  private getErrors(body: unknown): ApiFieldError[] | undefined {
    // 優先保留明確傳入的欄位錯誤。
    if (isRecord(body) && Array.isArray(body.errors)) {
      const errors = body.errors.filter(isFieldError).map((error) => ({
        field: error.field,
        code: error.code,
        message: error.message,
      }));

      if (errors.length > 0) {
        return errors;
      }
    }

    // 相容 Nest 預設的字串／字串陣列錯誤。
    const rawMessage = typeof body === 'string'
      ? body
      : isRecord(body)
        ? body.message
        : undefined;

    const messages =
      typeof rawMessage === 'string'
        ? [rawMessage]
        : Array.isArray(rawMessage)
          ? rawMessage.filter(
              (item): item is string => typeof item === 'string',
            )
          : [];

    if (messages.length === 0) {
      return undefined;
    }

    // 預設訊息沒有欄位資訊，不能靠文字猜測欄位。
    return messages.map((message) => ({
      field: '',
      code: 'INVALID_REQUEST',
      message,
    }));
  }
}
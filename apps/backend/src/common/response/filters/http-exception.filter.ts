import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.getMessage(exception, statusCode);

    // 為什麼要另外取 code：權限錯誤必須讓前端分辨 NO_APP_ROLE 與
    // PERMISSION_DENIED，而原本的 filter 只輸出 message，會把例外攜帶的 code 吃掉。
    const code = this.getErrorCode(exception);

    response.status(statusCode).json({
      statusCode,
      message,
      // 只有例外真的帶了 code 才附加欄位；既有 API 的錯誤回應形狀
      // 維持 { statusCode, message, data }，不會多出 null 欄位而改變契約。
      ...(code !== undefined && {
        code,
      }),
      data: null,
    });
  }

  /**
   * 取出例外攜帶的錯誤碼。
   *
   * 目前只有權限 Guard 會主動帶 code（NO_APP_ROLE / PERMISSION_DENIED），
   * 其餘例外一律回傳 undefined，確保既有錯誤回應不受影響。
   */
  private getErrorCode(exception: unknown) {
    if (!(exception instanceof HttpException)) {
      return undefined;
    }

    const exceptionResponse = exception.getResponse();

    if (
      typeof exceptionResponse !== 'object' ||
      exceptionResponse === null
    ) {
      return undefined;
    }

    const code = (
      exceptionResponse as {
        code?: unknown;
      }
    ).code;

    return typeof code === 'string' ? code : undefined;
  }

  private getMessage(
    exception: unknown,
    statusCode: number,
  ) {
    // NestJS HttpException
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      // 自己傳入的雙語格式
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as {
          message?: unknown;
        };

        if (
          typeof body.message === 'object' &&
          body.message !== null
        ) {
          const message = body.message as {
            en?: string;
            zh?: string;
          };

          if (message.en && message.zh) {
            return message;
          }
        }
      }

      // NestJS 預設錯誤
      return this.getDefaultMessage(statusCode);
    }

    // 未預期錯誤 → 500
    return {
      en: 'Internal server error',
      zh: '伺服器內部錯誤',
    };
  }

  private getDefaultMessage(statusCode: number) {
    const messages: Record<
      number,
      {
        en: string;
        zh: string;
      }
    > = {
      400: {
        en: 'Bad request',
        zh: '請求資料錯誤',
      },

      401: {
        en: 'Authentication is required',
        zh: '需要登入驗證',
      },

      403: {
        en: 'Forbidden',
        zh: '沒有權限執行此操作',
      },

      404: {
        en: 'Resource not found',
        zh: '找不到指定資源',
      },

      409: {
        en: 'Conflict',
        zh: '資料發生衝突',
      },

      422: {
        en: 'Unprocessable entity',
        zh: '資料驗證失敗',
      },

      429: {
        en: 'Too many requests',
        zh: '請求次數過多',
      },

      500: {
        en: 'Internal server error',
        zh: '伺服器內部錯誤',
      },

      502: {
        en: 'Bad gateway',
        zh: '上游伺服器錯誤',
      },

      503: {
        en: 'Service unavailable',
        zh: '服務暫時無法使用',
      },
    };

    return (
      messages[statusCode] ?? {
        en: 'Request failed',
        zh: '請求失敗',
      }
    );
  }
}
import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiProperty,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import type { ApiMessage } from '@test/shared';
import { ResponseMessage } from './response-message.decorator.js';

export class ApiMessageDto {
  @ApiProperty({ example: 'Request successful' })
  en!: string;

  @ApiProperty({ example: '請求成功' })
  zh!: string;
}

export class ApiFieldErrorDto {
  @ApiProperty({ example: 'email' })
  field!: string;

  @ApiProperty({ example: 'isEmail' })
  code!: string;

  @ApiProperty({ example: 'Email 格式不正確' })
  message!: string;
}

type ApiEnvelopeResponseOptions = {
  status: number;
  message: ApiMessage;
  data: Type<unknown>;
  isArray?: boolean;
};

/**
 * 明確描述全域 ResponseInterceptor 產生的 envelope。
 *
 * Nest Swagger 無法從 interceptor 推導 `{ statusCode, message, data }`，
 * 因此每個成功回應都要透過此 decorator 指定實際的 data DTO。
 */
export function ApiEnvelopeResponse({
  status,
  message,
  data,
  isArray = false,
}: ApiEnvelopeResponseOptions) {
  const dataSchema = isArray
    ? {
        type: 'array' as const,
        items: { $ref: getSchemaPath(data) },
      }
    : { $ref: getSchemaPath(data) };

  return applyDecorators(
    ApiExtraModels(ApiMessageDto, data),
    ResponseMessage(message),
    ApiResponse({
      status,
      description: message.zh,
      schema: {
        type: 'object',
        required: ['statusCode', 'message', 'data'],
        properties: {
          statusCode: { type: 'integer', example: status },
          message: { $ref: getSchemaPath(ApiMessageDto) },
          data: dataSchema,
        },
      },
    }),
  );
}

/** 描述 HttpExceptionFilter 統一輸出的錯誤 envelope。 */
export function ApiErrorEnvelopeResponse(status: number, message: ApiMessage) {
  return applyDecorators(
    ApiExtraModels(ApiMessageDto, ApiFieldErrorDto),
    ApiResponse({
      status,
      description: message.zh,
      schema: {
        type: 'object',
        required: ['statusCode', 'message', 'data'],
        properties: {
          statusCode: { type: 'integer', example: status },
          message: { $ref: getSchemaPath(ApiMessageDto) },
          data: { type: 'null', nullable: true, example: null },
          code: { type: 'string' },
          errors: {
            type: 'array',
            items: { $ref: getSchemaPath(ApiFieldErrorDto) },
          },
        },
      },
    }),
  );
}

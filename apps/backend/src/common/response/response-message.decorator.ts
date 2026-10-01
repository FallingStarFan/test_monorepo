import { SetMetadata } from '@nestjs/common';
import type { ApiMessage } from '@test/shared';

export const RESPONSE_MESSAGE_KEY = 'response:success-message';

/** 指定 ResponseInterceptor 應放入成功 envelope 的雙語訊息。 */
export const ResponseMessage = (message: ApiMessage) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);

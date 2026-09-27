import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

import env from '@/config/env.js';

function validateOAuthState(context: ExecutionContext): string {
  const request = context.switchToHttp().getRequest<Request>();
  const queryState =
    typeof request.query.state === 'string' ? request.query.state : undefined;
  const cookieState = request.cookies?.[env.oauthStateCookieName] as
    string | undefined;

  if (!queryState || !cookieState) throw invalidState();

  const queryBuffer = Buffer.from(queryState);
  const cookieBuffer = Buffer.from(cookieState);

  if (
    queryBuffer.length !== cookieBuffer.length ||
    !timingSafeEqual(queryBuffer, cookieBuffer)
  ) {
    throw invalidState();
  }

  return queryState;
}

function invalidState() {
  return new UnauthorizedException({
    message: {
      en: 'Invalid OAuth state',
      zh: 'OAuth state 驗證失敗',
    },
  });
}

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  override getAuthenticateOptions(context: ExecutionContext) {
    return { state: validateOAuthState(context) };
  }
}

@Injectable()
export class GithubOAuthGuard extends AuthGuard('github') {
  constructor() {
    super();
  }

  override getAuthenticateOptions(context: ExecutionContext) {
    return { state: validateOAuthState(context) };
  }
}

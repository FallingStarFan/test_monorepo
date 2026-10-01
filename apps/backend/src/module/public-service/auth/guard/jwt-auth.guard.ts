// jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { MESSAGES } from '@/common/response/messages.js';

export const ACCESS_TOKEN_COOKIE = 'access_token';

type AccessTokenPayload = {
  sub: string; // 使用者 ID
  type: 'access'; // 自訂：區分 access / refresh token
  iat?: number; // 簽發時間，Unix 秒數
  exp?: number; // 過期時間，Unix 秒數
  jti?: string; // Token ID，可用於撤銷或追蹤特定 token
  iss?: string; // 簽發者，例如 api.xingfan-studio.com
  aud?: string | string[]; // 使用對象
};

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    accessTokenIssuedAt: Date | null;
    accessTokenExpiresAt: Date;
    accessTokenId: string | null;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token: unknown = request.cookies?.[ACCESS_TOKEN_COOKIE];

    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException({
        message: MESSAGES.AUTHENTICATION_REQUIRED,
      });
    }

    try {
      // 驗證簽章與 exp；過期時會拋出錯誤。
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      if (
        typeof payload.sub !== 'string' ||
        !payload.sub ||
        payload.type !== 'access' ||
        typeof payload.exp !== 'number' ||
        !Number.isSafeInteger(payload.exp) ||
        payload.exp <= 0
      ) {
        throw new UnauthorizedException({ message: MESSAGES.TOKEN_INVALID });
      }

      const hasValidIssuedAt =
        typeof payload.iat === 'number' &&
        Number.isSafeInteger(payload.iat) &&
        payload.iat > 0;

      request.user = {
        id: payload.sub,
        accessTokenIssuedAt: hasValidIssuedAt
          ? new Date(payload.iat! * 1000)
          : null,
        accessTokenExpiresAt: new Date(payload.exp * 1000),
        accessTokenId:
          typeof payload.jti === 'string' && payload.jti ? payload.jti : null,
      };

      return true;
    } catch {
      throw new UnauthorizedException({
        message: MESSAGES.TOKEN_INVALID_OR_EXPIRED,
      });
    }
  }
}

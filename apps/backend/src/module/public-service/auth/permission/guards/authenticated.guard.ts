import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import env from '@/config/env.js';
import { JwtAuthService } from '@/module/public-service/auth/services/jwt/jwt.service.js';

export interface AuthenticatedRequest extends Request {
  currentUserId?: string;
  currentSessionId?: string;
  currentAccessTokenExpiresAt?: Date;
  appAccess?: {
    appId: string | null;
    appName: string;
    roles: {
      id: string;
      name: string;
      description: string | null;
    }[];
    roleNames: string[];
    permissionCodes: string[];
  };
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(protected readonly jwtAuthService: JwtAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractAccessToken(request);

    if (!token) {
      throw new UnauthorizedException({
        message: {
          en: 'Access token is missing',
          zh: '缺少 Access Token',
        },
      });
    }

    const verified = await this.jwtAuthService.verifyAccessToken(token);

    request.currentUserId = verified.userId;
    request.currentSessionId = verified.sessionId;
    request.currentAccessTokenExpiresAt = verified.expiresAt;
    return true;
  }

  protected extractAccessToken(
    request: AuthenticatedRequest,
  ): string | undefined {
    const cookieToken = (
      request.cookies as Record<string, string> | undefined
    )?.[env.accessCookieName];

    if (cookieToken) return cookieToken;

    const authorization = request.headers.authorization;

    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice('Bearer '.length).trim() || undefined;
    }

    return undefined;
  }
}

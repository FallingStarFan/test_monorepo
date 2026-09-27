import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';

import env from '@/config/env.js';

import { SessionService } from '../../sessions/sessions.service.js';

interface TokenPayload {
  sub: string;
  sid: string;
  type: 'access' | 'refresh';
  exp: number;
  jti: string;
}

@Injectable()
export class JwtAuthService {
  private readonly refreshJwtService = new JwtService({
    secret: env.jwtRefreshSecret,
    signOptions: {
      expiresIn: env.jwtRefreshExpires,
    },
  });

  constructor(
    private readonly accessJwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  issueAccessToken(userId: string, sessionId: string) {
    return this.issueToken(this.accessJwtService, userId, sessionId, 'access');
  }

  issueRefreshToken(userId: string, sessionId: string) {
    return this.issueToken(
      this.refreshJwtService,
      userId,
      sessionId,
      'refresh',
    );
  }

  async verifyAccessToken(token: string) {
    const payload = await this.verifyToken(
      this.accessJwtService,
      token,
      'access',
    );
    const session = await this.sessionService.findActiveById(
      payload.sid,
      payload.sub,
    );

    if (!session) {
      throw this.unauthorized('Access token session is expired or revoked');
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
      expiresAt: new Date(payload.exp * 1000),
    };
  }

  async verifyRefreshToken(token: string) {
    const payload = await this.verifyToken(
      this.refreshJwtService,
      token,
      'refresh',
    );

    return {
      userId: payload.sub,
      sessionId: payload.sid,
      expiresAt: new Date(payload.exp * 1000),
    };
  }

  private async issueToken(
    service: JwtService,
    userId: string,
    sessionId: string,
    type: TokenPayload['type'],
  ) {
    const token = await service.signAsync({
      sub: userId,
      sid: sessionId,
      type,
      jti: randomUUID(),
    });
    const payload = service.decode(token) as Pick<TokenPayload, 'exp'> | null;

    if (!payload?.exp) {
      throw new Error('JWT expiration is missing');
    }

    return {
      token,
      expiresAt: new Date(payload.exp * 1000),
    };
  }

  private async verifyToken(
    service: JwtService,
    token: string,
    expectedType: TokenPayload['type'],
  ): Promise<TokenPayload> {
    try {
      const payload = await service.verifyAsync<TokenPayload>(token);

      if (
        payload.type !== expectedType ||
        !payload.sub ||
        !payload.sid ||
        !payload.exp
      ) {
        throw new Error('Unexpected JWT payload');
      }

      return payload;
    } catch {
      throw this.unauthorized(`Invalid or expired ${expectedType} token`);
    }
  }

  private unauthorized(message: string) {
    return new UnauthorizedException({
      message: {
        en: message,
        zh: 'JWT 無效、已過期或所屬 Session 已撤銷',
      },
    });
  }
}

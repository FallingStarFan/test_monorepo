// services/jwt/jwt.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';

type TokenType = 'access' | 'refresh';

type AuthJwtPayload = {
  sub: string;
  type: TokenType;
  iat?: number;
  exp?: number;
  jti?: string;
};

type IssuedToken = {
  token: string;
  expiresAt: Date;
};

type VerifiedToken = {
  userId: string;
  expiresAt: Date;
};

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueAccessToken(userId: string): Promise<IssuedToken> {
    return this.issueToken(
      userId,
      'access',
      this.accessSecret,
      ACCESS_TOKEN_TTL_SECONDS,
    );
  }

  async issueRefreshToken(userId: string): Promise<IssuedToken> {
    return this.issueToken(
      userId,
      'refresh',
      this.refreshSecret,
      REFRESH_TOKEN_TTL_SECONDS,
    );
  }

  async verifyAccessToken(token: string): Promise<VerifiedToken> {
    return this.verifyToken(token, 'access', this.accessSecret);
  }

  async verifyRefreshToken(token: string): Promise<VerifiedToken> {
    return this.verifyToken(token, 'refresh', this.refreshSecret);
  }

  private async issueToken(
    userId: string,
    type: TokenType,
    secret: string,
    ttlSeconds: number,
  ): Promise<IssuedToken> {
    const token = await this.jwtService.signAsync(
      { sub: userId, type },
      {
        secret,
        algorithm: 'HS256',
        expiresIn: ttlSeconds,
        jwtid: randomUUID(),
      },
    );

    // 從實際簽出的 JWT 讀 exp，避免自行計算造成秒數誤差。
    const payload = this.jwtService.decode<AuthJwtPayload>(token);

    if (typeof payload?.exp !== 'number') {
      throw new Error('JWT 簽發後缺少 exp');
    }

    return {
      token,
      expiresAt: new Date(payload.exp * 1000),
    };
  }

  private async verifyToken(
    token: string,
    expectedType: TokenType,
    secret: string,
  ): Promise<VerifiedToken> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(
        token,
        {
          secret,
          algorithms: ['HS256'],
        },
      );

      if (
        typeof payload.sub !== 'string' ||
        !payload.sub ||
        payload.type !== expectedType ||
        typeof payload.exp !== 'number' ||
        !Number.isSafeInteger(payload.exp) ||
        payload.exp <= 0
      ) {
        throw new UnauthorizedException('JWT 內容無效');
      }

      return {
        userId: payload.sub,
        expiresAt: new Date(payload.exp * 1000),
      };
    } catch {
      throw new UnauthorizedException('JWT 無效或已過期');
    }
  }

  private get accessSecret(): string {
    return this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  private get refreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }
}
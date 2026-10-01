// services/jwt/jwt.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { MESSAGES } from '@/common/response/messages.js';

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

/**
 * 負責簽發與驗證登入用 JWT。
 *
 * Access token 用於一般 API 身分驗證，有效期 15 分鐘；
 * refresh token 用於換發 token，有效期 30 天。
 * 兩者使用不同密鑰，並透過 payload.type 再次確認用途。
 */
@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /** 簽發供一般 API 使用的 access token。 */
  async issueAccessToken(userId: string): Promise<IssuedToken> {
    return this.issueToken(
      userId,
      'access',
      this.accessSecret,
      ACCESS_TOKEN_TTL_SECONDS,
    );
  }

  /** 簽發供刷新登入狀態使用的 refresh token。 */
  async issueRefreshToken(userId: string): Promise<IssuedToken> {
    return this.issueToken(
      userId,
      'refresh',
      this.refreshSecret,
      REFRESH_TOKEN_TTL_SECONDS,
    );
  }

  /** 驗證 access token，成功後回傳使用者 ID 與到期時間。 */
  async verifyAccessToken(token: string): Promise<VerifiedToken> {
    return this.verifyToken(token, 'access', this.accessSecret);
  }

  /** 驗證 refresh token，成功後回傳使用者 ID 與到期時間。 */
  async verifyRefreshToken(token: string): Promise<VerifiedToken> {
    return this.verifyToken(token, 'refresh', this.refreshSecret);
  }

  /**
   * 簽發指定類型的 JWT。
   *
   * jti 為每次簽發建立不同 ID，避免同一使用者在同一秒取得內容完全相同的 token。
   */
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

    // 直接採用 JWT 內的 exp，讓回傳的到期時間與 token 實際到期時間一致。
    const payload = this.jwtService.decode<AuthJwtPayload>(token);

    if (typeof payload?.exp !== 'number') {
      throw new Error('JWT 簽發後缺少 exp');
    }

    return {
      token,
      expiresAt: new Date(payload.exp * 1000),
    };
  }

  /**
   * 驗證簽章、有效期、演算法與 token 用途。
   *
   * 驗證失敗時統一回傳 401，避免把 JWT 函式庫的錯誤細節暴露給呼叫端。
   */
  private async verifyToken(
    token: string,
    expectedType: TokenType,
    secret: string,
  ): Promise<VerifiedToken> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token, {
        secret,
        algorithms: ['HS256'],
      });

      // verifyAsync 驗證 JWT；這裡再檢查應用程式要求的欄位與 token 類型。
      if (
        typeof payload.sub !== 'string' ||
        !payload.sub ||
        payload.type !== expectedType ||
        typeof payload.exp !== 'number' ||
        !Number.isSafeInteger(payload.exp) ||
        payload.exp <= 0
      ) {
        throw new UnauthorizedException({ message: MESSAGES.TOKEN_INVALID });
      }

      return {
        userId: payload.sub,
        expiresAt: new Date(payload.exp * 1000),
      };
    } catch {
      throw new UnauthorizedException({
        message: MESSAGES.TOKEN_INVALID_OR_EXPIRED,
      });
    }
  }

  /** 讀取 access token 的簽章密鑰；未設定時拒絕簽發或驗證。 */
  private get accessSecret(): string {
    return this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  /** 讀取 refresh token 的簽章密鑰；未設定時拒絕簽發或驗證。 */
  private get refreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }
}

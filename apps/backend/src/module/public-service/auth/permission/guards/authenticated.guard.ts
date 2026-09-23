import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthService } from '@/module/public-service/auth/services/jwt/jwt.service.js';

/**
 * 帶有登入資訊的 Request。
 *
 * 為什麼要另外定義型別：Controller 取得的是 Express 的 Request，
 * 直接在上面掛自訂欄位會讓 TypeScript 無法檢查；集中宣告一次，
 * 之後所有 Guard 與 Controller 都共用同一份欄位定義。
 */
export interface AuthenticatedRequest extends Request {
  currentUserId?: string;
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

/**
 * 只檢查「有沒有登入」的 Guard。
 *
 * 為什麼需要它與 PermissionGuard 分開：
 * 有些端點（例如「查詢我自己的權限」）只要登入就能使用，
 * 即使使用者在 public-service 沒有角色也應該能拿到空清單，
 * 前端才能正確顯示「尚未被指派角色」。若強制套用 PermissionGuard，
 * 這類端點會回 403 NO_APP_ROLE，前端反而無法區分「沒登入」與「沒角色」。
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    protected readonly jwtAuthService: JwtAuthService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const token = this.extractAccessToken(request);

    if (!token) {
      throw new UnauthorizedException({
        message: {
          en: 'Access token is missing',
          zh: '缺少 Access Token',
        },
      });
    }

    // verifyAccessToken 內部已處理簽章錯誤與過期，
    // 因此這裡不需要再自行 try/catch，避免把 401 誤轉成其他錯誤。
    const { userId } =
      await this.jwtAuthService.verifyAccessToken(token);

    request.currentUserId = userId;

    return true;
  }

  /**
   * 取得 Access Token。
   *
   * 為什麼同時支援 Cookie 與 Authorization 標頭：
   * 前端採用 HttpOnly Cookie 是為了避免 XSS 取得 Token，
   * 但 Swagger 與自動測試用 Bearer 標頭更方便；
   * 兩種來源都能用同一組驗證邏輯，就不必為了測試放寬安全設定。
   */
  protected extractAccessToken(
    request: AuthenticatedRequest,
  ): string | undefined {
    const cookieToken = (
      request.cookies as
        | Record<string, string>
        | undefined
    )?.access_token;

    if (cookieToken) {
      return cookieToken;
    }

    const authorization =
      request.headers.authorization;

    if (authorization?.startsWith('Bearer ')) {
      return authorization
        .slice('Bearer '.length)
        .trim();
    }

    return undefined;
  }
}

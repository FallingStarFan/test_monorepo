import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  AUTH_ERROR_CODES,
} from '@test/shared';

import { JwtAuthService } from '@/module/public-service/auth/services/jwt/jwt.service.js';

import { PermissionService } from '../permission.service.js';

import { AuthenticatedGuard } from './authenticated.guard.js';
import type { AuthenticatedRequest } from './authenticated.guard.js';

import {
  APP_SCOPE_METADATA_KEY,
  DEFAULT_APP_SCOPE,
  REQUIRED_PERMISSIONS_METADATA_KEY,
  REQUIRED_ROLES_METADATA_KEY,
} from '../permission.constants.js';

/**
 * 細粒度權限 Guard。
 *
 * 為什麼繼承 AuthenticatedGuard 而不是重寫一次登入檢查：
 * 「先確認有登入、再確認有沒有權限」是固定順序，
 * 繼承讓 401 的判斷只有一份實作，PermissionGuard 專注在 403 的兩種情境。
 *
 * 檢查順序與對應結果（順序本身就是需求的一部分）：
 *
 * 1. 沒有 Token          → 401
 * 2. 沒有該 App 的任何角色 → 403 code = NO_APP_ROLE
 * 3. 有角色但角色不符 / 缺權限碼 → 403 code = PERMISSION_DENIED
 *
 * 為什麼第 2、3 步要回不同的 code：
 * 前端對這兩種狀態的處理方式完全不同——「沒有 App 角色」通常要引導使用者
 * 去申請開通，而「缺權限」是角色設定不足，只需提示聯絡管理員。
 * 若都回同一個 403，前端只能顯示一句模糊的「沒有權限」。
 */
@Injectable()
export class PermissionGuard
  extends AuthenticatedGuard
  implements CanActivate
{
  constructor(
    jwtAuthService: JwtAuthService,
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {
    super(jwtAuthService);
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // 先完成登入檢查（未登入會直接丟 401，不會走到下面的權限判斷）
    await super.canActivate(context);

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const userId = request.currentUserId as string;

    // 讀取 Controller 用 Decorator 宣告的需求。
    // getAllAndOverride 會先看方法、再看類別，因此類別層宣告「需要 ADMIN 角色」、
    // 方法層宣告「需要 app:write」時，兩者都會被套用。
    const appName =
      this.reflector.getAllAndOverride<string>(
        APP_SCOPE_METADATA_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? DEFAULT_APP_SCOPE;

    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(
        REQUIRED_ROLES_METADATA_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        REQUIRED_PERMISSIONS_METADATA_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    const access =
      await this.permissionService.findUserAppAccess(
        userId,
        appName,
      );

    // ----------------------------------------------------------
    // 情境一：完全沒有這個 App 的角色
    // ----------------------------------------------------------

    if (access.roles.length === 0) {
      throw new ForbiddenException({
        code: AUTH_ERROR_CODES.NO_APP_ROLE,
        message: {
          en: `User has no role in app "${appName}"`,
          zh: `使用者沒有「${appName}」的任何角色`,
        },
      });
    }

    // ----------------------------------------------------------
    // 情境二：角色名稱不符
    // ----------------------------------------------------------

    const hasRequiredRole =
      requiredRoles.length === 0 ||
      requiredRoles.some((roleName) =>
        access.roleNames.includes(roleName),
      );

    if (!hasRequiredRole) {
      throw new ForbiddenException({
        code: AUTH_ERROR_CODES.PERMISSION_DENIED,
        message: {
          en: `Requires role: ${requiredRoles.join(', ')}`,
          zh: `需要角色：${requiredRoles.join('、')}`,
        },
      });
    }

    // ----------------------------------------------------------
    // 情境三：角色存在但缺少權限碼
    // ----------------------------------------------------------

    const missingPermissions =
      requiredPermissions.filter(
        (permissionCode) =>
          !access.permissionCodes.includes(permissionCode),
      );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException({
        code: AUTH_ERROR_CODES.PERMISSION_DENIED,
        message: {
          en: `Missing permission: ${missingPermissions.join(', ')}`,
          zh: `缺少權限：${missingPermissions.join('、')}`,
        },
      });
    }

    // 把算好的存取範圍放進 request，
    // 讓 Controller 可以透過 @CurrentAccess() 直接取用，不必再查一次資料庫。
    request.appAccess = access;

    return true;
  }
}

import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

import type { UserAppAccess } from '../permission.service.js';

import {
  APP_SCOPE_METADATA_KEY,
  REQUIRED_PERMISSIONS_METADATA_KEY,
  REQUIRED_ROLES_METADATA_KEY,
} from '../permission.constants.js';

// ============================================================
// 宣告式權限 API
// ============================================================

/**
 * 為什麼這幾個 Decorator 放在同一個檔案：
 *
 * 它們共同構成「Controller 如何宣告自己需要什麼權限」的完整語彙
 * （要哪個 App 的角色、要哪些權限碼、如何取得運算結果）。
 * 放在一起閱讀時能一次看懂整套宣告方式；拆成四個十行檔案反而要來回跳檔。
 * 實際的判斷邏輯完全在 PermissionGuard，Decorator 只負責「寫下需求」。
 */

/**
 * 宣告端點需要的權限碼。
 *
 * 多個權限碼之間是「且」的關係：全部具備才放行。
 * 之所以預設採「且」，是因為管理端點通常需要同時讀寫（例如列表 + 明細），
 * 若採「或」的語意，很容易不小心讓只有讀取權的人執行了寫入操作。
 */
export const RequirePermission = (
  ...permissionCodes: string[]
) =>
  SetMetadata(
    REQUIRED_PERMISSIONS_METADATA_KEY,
    permissionCodes,
  );

/**
 * 宣告端點需要的角色名稱。
 *
 * 與 RequirePermission 的差別：角色是「身分」，權限是「能力」。
 * 需求要求管理 API 限定 public-service 的 ADMIN 角色，
 * 因此這裡用來表達身分限制，權限碼則表達細粒度能力限制。
 */
export const RequireRole = (
  ...roleNames: string[]
) =>
  SetMetadata(
    REQUIRED_ROLES_METADATA_KEY,
    roleNames,
  );

/**
 * 宣告端點要檢查哪一個 App 的角色。
 *
 * 為什麼需要它：未來如果出現第二個 App 的管理端點，
 * 只要覆寫這個 Decorator 就能切換檢查對象，
 * 不必複製一份 Guard 或改動共用邏輯。
 */
export const AppScope = (appName: string) =>
  SetMetadata(
    APP_SCOPE_METADATA_KEY,
    appName,
  );

/**
 * 取出 Guard 已經算好的存取範圍。
 *
 * 為什麼用 Decorator 而不是讓 Controller 自己再查一次：
 * Guard 為了做判斷本來就得查出角色與權限，把它掛在 request 上再取出，
 * 同一個請求就不會為了「顯示目前權限」而重複查資料庫。
 */
export const CurrentAccess = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): UserAppAccess | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<{
        appAccess?: UserAppAccess;
      }>();

    return request.appAccess;
  },
);

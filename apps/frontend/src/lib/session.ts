/**
 * 前端可見的登入狀態型別。
 *
 * 這些型別同時被 BFF（`/api/auth/session`）與前端元件使用，
 * 集中定義可避免兩邊對欄位有不同想像（例如一邊叫 role、一邊叫 roleNames）。
 */
import { SYSTEM_ROLE_ADMIN } from '@test/shared';

/** 由 BFF 挑選後才回傳給瀏覽器的使用者欄位（不含任何憑證或密碼相關資料）。 */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

/** 登入狀態回應。 */
export interface SessionResponse {
  /** ? UI ???????? JWT ???Token ??????????? */
  authType: 'jwt' | 'anonymous';
  /** 是否已登入（由後端 /auth/me 的結果決定）。 */
  authenticated: boolean;
  user: SessionUser | null;
  /** 使用者在 public-service 的角色名稱。 */
  roleNames: string[];
  /** 使用者在 public-service 具備的權限碼。 */
  permissionCodes: string[];
  /**
   * 是否具備 public-service 的 ADMIN 角色。
   *
   * 這只用來決定「畫面要不要顯示入口」，不是授權依據；
   * 真正的存取控制一律由後端 Guard 判斷。
   */
  isAdmin: boolean;
}

/** 未登入的預設狀態。 */
export const ANONYMOUS_SESSION: SessionResponse = {
  authType: 'anonymous',
  authenticated: false,
  user: null,
  roleNames: [],
  permissionCodes: [],
  isAdmin: false,
};

/** 判斷角色清單是否包含 ADMIN。 */
export function hasAdminRole(
  roleNames: readonly string[],
): boolean {
  return roleNames.includes(SYSTEM_ROLE_ADMIN);
}

/** 依登入狀態取出畫面上要顯示的名稱。 */
export function resolveDisplayName(
  user: SessionUser | null,
): string {
  if (!user) {
    return '訪客';
  }

  return user.name?.trim() || user.email;
}

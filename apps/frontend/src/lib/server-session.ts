import {
  AUTH_ME_API_PATH,
  HTTP_STATUS,
  MY_PERMISSION_API_PATH,
} from '@test/shared';

import { callBackendApi } from '@/lib/bff';
import {
  ANONYMOUS_SESSION,
  hasAdminRole,
  type SessionResponse,
  type SessionUser,
} from '@/lib/session';

/**
 * 伺服器端登入狀態載入（layout 與 BFF 共用）。
 *
 * 為什麼要在伺服器端先載入一次，而不是全部交給瀏覽器：
 * 側邊導覽與頁首都要依「是否為 ADMIN」決定顯示內容，
 * 若等瀏覽器取得狀態後才更新，ADMIN 使用者第一眼會看不到「控制台」，
 * 非 ADMIN 也可能先閃出一個不該看到的入口。
 * 由伺服器端帶 Cookie 問完後端再輸出 HTML，畫面第一次就正確。
 *
 * 這裡同樣只負責「顯示與否」，真正的授權仍由後端 Guard 決定。
 */
interface CurrentUserPayload {
  user?: Record<string, unknown>;
}

interface UserAppAccessPayload {
  roleNames?: string[];
  permissionCodes?: string[];
}

/** 只挑出畫面需要的欄位，避免把後端實體（可能含密碼雜湊）送進瀏覽器。 */
function pickSessionUser(user: Record<string, unknown>): SessionUser {
  return {
    id: String(user.id ?? ''),
    email: String(user.email ?? ''),
    name: typeof user.name === 'string' ? user.name : null,
  };
}

/**
 * 取得目前登入狀態。
 *
 * 回傳 null 代表後端連不上（與「未登入」是兩件不同的事），
 * 呼叫端可據此顯示錯誤提示或退回匿名狀態。
 */
export async function getServerSession(): Promise<SessionResponse | null> {
  const me = await callBackendApi<CurrentUserPayload>(AUTH_ME_API_PATH);

  if (!me) {
    return null;
  }

  if (me.status === HTTP_STATUS.UNAUTHORIZED || !me.payload?.user) {
    return ANONYMOUS_SESSION;
  }

  const access = await callBackendApi<UserAppAccessPayload>(
    MY_PERMISSION_API_PATH,
  );

  const roleNames = access?.payload?.roleNames ?? [];

  return {
    authenticated: true,
    user: pickSessionUser(me.payload.user),
    roleNames,
    permissionCodes: access?.payload?.permissionCodes ?? [],
    isAdmin: hasAdminRole(roleNames),
  };
}

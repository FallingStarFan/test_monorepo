import {
  MY_PERMISSION_API_PATH,
} from '@test/shared';

import { forwardBackendApi } from '@/lib/bff';

/**
 * 目前登入者權限的 BFF 代理（Next.js Route Handler）。
 *
 * 對應後端 `GET /api/permissions/me`：只要求登入，未登入回 401。
 * 前端靠這份資料決定導覽與按鈕是否顯示（例如「控制台」只給 ADMIN）。
 *
 * 為什麼不讓前端自己呼叫後端：Access Token 存在 HttpOnly Cookie，
 * 瀏覽器讀不到；由 BFF 帶 Cookie 轉發才不必把 Token 交給前端。
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return forwardBackendApi(MY_PERMISSION_API_PATH);
}

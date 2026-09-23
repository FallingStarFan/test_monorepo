import {
  ADMIN_APPS_API_PATH,
} from '@test/shared';

import { forwardBackendApi } from '@/lib/bff';

/**
 * App 清單的 BFF 代理（Next.js Route Handler）。
 *
 * 對應後端 `GET /api/admin/apps`：需要 public-service 的 ADMIN 角色與 APP_READ 權限。
 * 控制台頁面只呼叫這個同源路徑，由 BFF 帶著 HttpOnly Cookie 轉發，
 * 授權結果（401 / 403 NO_APP_ROLE / 403 PERMISSION_DENIED）原樣回給前端。
 *
 * 為什麼一定要 force-dynamic：
 * 回應內容取決於「請求者帶了什麼 Cookie」與後端的即時授權結果，
 * 一旦被當成靜態路由快取，就可能把某個使用者的結果回給其他人。
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return forwardBackendApi(ADMIN_APPS_API_PATH);
}

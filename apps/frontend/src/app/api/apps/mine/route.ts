import {
  MY_APPS_API_PATH,
} from '@test/shared';

import { forwardBackendApi } from '@/lib/bff';

/**
 * App 入口清單的 BFF 代理（Next.js Route Handler）。
 *
 * 對應後端 `GET /api/apps/mine`：只需要登入，不需要任何角色或權限碼。
 * 入口頁只呼叫這個同源路徑，由 BFF 帶著 HttpOnly Cookie 轉發，
 * 瀏覽器端因此拿不到 Access Token，也不必自行拼出後端位址。
 *
 * 為什麼一定要 force-dynamic：
 * 回應內容取決於「請求者帶了什麼 Cookie」——同一份程式在未登入時回 401、
 * 在不同帳號下回不同的 App 清單。一旦被當成靜態路由或 CDN 快取，
 * 就可能把某個使用者的 App 清單回給另一個人。
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return forwardBackendApi(MY_APPS_API_PATH);
}

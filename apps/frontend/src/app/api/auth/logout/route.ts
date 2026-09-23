import { AUTH_LOGOUT_API_PATH } from '@test/shared';

import { forwardBackendApi } from '@/lib/bff';

/**
 * 登出的 BFF 代理（Next.js Route Handler）。
 *
 * 後端 `POST /api/auth/logout` 會以 clearCookie 回傳清除 access_token 的 Set-Cookie，
 * 這個回應必須原樣透傳回瀏覽器，登出才真的生效；
 * forwardBackendApi 會一併轉送狀態碼、內容與 Set-Cookie。
 */
export const dynamic = 'force-dynamic';

export function POST() {
  return forwardBackendApi(AUTH_LOGOUT_API_PATH, {
    method: 'POST',
  });
}

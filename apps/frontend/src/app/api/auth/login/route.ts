import { NextResponse } from 'next/server';

import { AUTH_LOGIN_API_PATH } from '@test/shared';

import { forwardBackendApi } from '@/lib/bff';

/**
 * 登入的 BFF 代理（Next.js Route Handler）。
 *
 * 為什麼要經過 BFF 而不是前端直接呼叫後端：
 * 登入成功時後端會以 Set-Cookie 簽發 HttpOnly access_token。
 * 若由瀏覽器跨域呼叫，除了得放寬後端 CORS 設定，Cookie 的可見網域也會變成後端網域，
 * 前端伺服器端（BFF）就讀不到它，後續所有轉發都會變成未登入。
 * 走同源 BFF 轉發，Cookie 落在前端網域，BFF 才能帶著它呼叫後端。
 *
 * 這裡只轉發請求與回應，不驗證帳密、也不判斷登入結果。
 */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as unknown;

  if (body === null) {
    return NextResponse.json(
      {
        statusCode: 400,
        message: {
          en: 'Invalid JSON body',
          zh: '請求內容格式錯誤',
        },
        data: null,
      },
      { status: 400 },
    );
  }

  return forwardBackendApi(AUTH_LOGIN_API_PATH, {
    method: 'POST',
    body,
  });
}

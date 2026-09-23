import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import {
  API_PREFIX,
  DASHBOARD_OVERVIEW_API_PATH,
  DEFAULT_API_PORT,
  type ApiResponse,
} from '@test/shared';

/**
 * 總覽資料的 BFF 代理（Next.js Route Handler）。
 *
 * 為什麼不讓瀏覽器直接呼叫後端：
 * Access Token 存放在 HttpOnly Cookie，瀏覽器端的 JavaScript 拿不到它，
 * 也不應該拿得到。改由 Next.js 伺服器端（同源請求可讀 Cookie）帶著 Cookie
 * 轉發給後端，瀏覽器只看得到同源的 /api/dashboard/overview，
 * 既不需要跨域，Token 也不會出現在瀏覽器可見的請求中。
 *
 * 為什麼一定要 force-dynamic：
 * 這個回應內容取決於「請求者帶了什麼 Cookie」與後端的即時授權結果，
 * 一旦被 Next.js 當成靜態路由快取，就可能把某個使用者的結果回給其他人。
 */
export const dynamic = 'force-dynamic';

/** 後端存放 Access Token 的 Cookie 名稱（與 AuthenticatedGuard 的讀取名稱一致）。 */
const ACCESS_TOKEN_COOKIE = 'access_token';

/** 後端無法連線時回傳的狀態碼（語意為上游閘道錯誤）。 */
const BAD_GATEWAY = 502;

/**
 * 組出後端總覽端點的絕對網址。
 *
 * 為什麼要處理前綴重複：NEXT_PUBLIC_API_BASE_URL 既可能是
 * `http://localhost:3013`（本專案 .env.local 的寫法），也可能有人寫成
 * 已含 `/api` 的形式。兩種都支援，可避免設定方式不同就出現 /api/api 的 404。
 */
function resolveBackendUrl(): string {
  const rawBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    `http://localhost:${DEFAULT_API_PORT}`
  ).replace(/\/+$/, '');

  const baseUrl = rawBaseUrl.endsWith(API_PREFIX)
    ? rawBaseUrl.slice(0, -API_PREFIX.length)
    : rawBaseUrl;

  return `${baseUrl}${DASHBOARD_OVERVIEW_API_PATH}`;
}

/** 組出與後端錯誤格式一致的 BFF 自身錯誤回應。 */
function gatewayErrorResponse(): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      statusCode: BAD_GATEWAY,
      message: {
        en: 'Backend service is unavailable',
        zh: '無法連線到後端服務',
      },
      data: null,
    },
    {
      status: BAD_GATEWAY,
    },
  );
}

export async function GET() {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  const headers: Record<string, string> = {
    accept: 'application/json',
  };

  // 沒有 Cookie 時刻意不帶任何身分資訊，讓後端自行回 401；
  // 由後端決定授權結果，BFF 不自行判斷登入狀態，兩邊的規則才不會各講一套。
  if (token) {
    headers.cookie = `${ACCESS_TOKEN_COOKIE}=${token}`;
  }

  try {
    const backendResponse = await fetch(resolveBackendUrl(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const payload = (await backendResponse
      .json()
      .catch(() => null)) as unknown;

    if (payload === null) {
      return gatewayErrorResponse();
    }

    // 原樣轉發狀態碼與內容（含 401 以及 403 的 NO_APP_ROLE / PERMISSION_DENIED），
    // 前端才能依 code 分辨「未登入」與「已登入但非 ADMIN」兩種情境。
    return NextResponse.json(payload, {
      status: backendResponse.status,
    });
  } catch {
    return gatewayErrorResponse();
  }
}


import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  API_PREFIX,
  DEFAULT_API_PORT,
  type ApiResponse,
} from '@test/shared';

/**
 * BFF（Backend for Frontend）共用工具。
 *
 * 為什麼要有這一層：
 * Access Token 存放在 HttpOnly Cookie，瀏覽器端 JavaScript 讀不到，也不應該讀得到。
 * 若讓瀏覽器直接呼叫後端，就得把 Token 交給前端或改成跨域帶 Cookie，
 * 前者會暴露憑證，後者必須放寬後端 CORS（WEB_ORIGIN），兩種都不是這個專案想承擔的風險。
 * 因此所有前端資料請求都走 Next.js Route Handler：由伺服器端讀 Cookie 後轉發，
 * 瀏覽器只看得到同源的 BFF 路徑。
 *
 * 為什麼 BFF 不自行判斷登入狀態：
 * 授權規則只有後端一份（401 / 403 NO_APP_ROLE / 403 PERMISSION_DENIED），
 * BFF 若自己再判斷一次，兩邊規則就會各講一套。這裡只做「轉發 + 原樣回傳狀態碼」。
 */

/** 後端存放 Access Token 的 Cookie 名稱（與 AuthenticatedGuard 的讀取名稱一致）。 */
export const ACCESS_TOKEN_COOKIE = 'access_token';

/** 後端無法連線時回傳的狀態碼（語意為上游閘道錯誤）。 */
const BAD_GATEWAY = 502;

/** 後端請求選項。 */
export interface BackendRequestOptions {
  /** HTTP Method，預設 GET。 */
  method?: string;
  /** 要轉送的 JSON 內容；GET / 無 body 的請求不需要傳。 */
  body?: unknown;
}

/**
 * 組出後端端點的絕對網址。
 *
 * NEXT_PUBLIC_API_BASE_URL 既可能是 `http://localhost:3013`，
 * 也可能有人寫成已含 `/api` 的形式；兩種都支援，避免設定方式不同就出現 /api/api 的 404。
 */
export function resolveBackendUrl(
  apiPath: string,
): string {
  const rawBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    `http://localhost:${DEFAULT_API_PORT}`
  ).replace(/\/+$/, '');

  const baseUrl = rawBaseUrl.endsWith(API_PREFIX)
    ? rawBaseUrl.slice(0, -API_PREFIX.length)
    : rawBaseUrl;

  return `${baseUrl}${apiPath}`;
}

/**
 * 呼叫後端並回傳原始 Response。
 *
 * 回傳 null 代表後端連不上（網路錯誤、服務未啟動），由呼叫端決定要回 502 還是視為未登入。
 */
export async function fetchBackend(
  apiPath: string,
  options: BackendRequestOptions = {},
): Promise<Response | null> {
  const token = (await cookies()).get(
    ACCESS_TOKEN_COOKIE,
  )?.value;

  const headers: Record<string, string> = {
    accept: 'application/json',
  };

  // 沒有 Cookie 時刻意不帶任何身分資訊，讓後端自行回 401；
  // 由後端決定授權結果，BFF 不自行判斷登入狀態。
  if (token) {
    headers.cookie = `${ACCESS_TOKEN_COOKIE}=${token}`;
  }

  if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  try {
    return await fetch(resolveBackendUrl(apiPath), {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

/** 後端呼叫結果：連不上或回應非 JSON 時為 null。 */
export interface BackendCallResult<T> {
  status: number;
  payload: T | null;
}

/**
 * 呼叫後端並解析 JSON，供需要「依狀態碼與內容組出新回應」的 BFF 使用（例如登入狀態）。
 */
export async function callBackendApi<T>(
  apiPath: string,
  options: BackendRequestOptions = {},
): Promise<BackendCallResult<T> | null> {
  const response = await fetchBackend(apiPath, options);

  if (!response) {
    return null;
  }

  const payload = (await response
    .json()
    .catch(() => null)) as T | null;

  return {
    status: response.status,
    payload,
  };
}

/** BFF 自身的錯誤回應：與後端錯誤格式一致，前端可用同一套解析邏輯。 */
export function gatewayErrorResponse(): NextResponse<ApiResponse<null>> {
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

/**
 * 讀出後端回應的 Set-Cookie。
 *
 * Node 的 Headers 提供 getSetCookie() 才能正確取得多個 Set-Cookie；
 * 舊執行環境只有 get()，此時至少把合併後的字串帶回去，登入 Cookie 仍能運作。
 */
function readSetCookies(
  headers: Headers,
): string[] {
  const getSetCookie = (
    headers as Headers & {
      getSetCookie?: () => string[];
    }
  ).getSetCookie;

  if (typeof getSetCookie === 'function') {
    return getSetCookie.call(headers);
  }

  const single = headers.get('set-cookie');

  return single ? [single] : [];
}

/**
 * 原樣轉發後端回應（狀態碼、內容、Set-Cookie）。
 *
 * 為什麼要透傳 Set-Cookie：登入與登出的 Cookie 由後端簽發與清除，
 * 若 BFF 只回傳 JSON body，登入後瀏覽器不會取得 access_token，授權流程就無法成立。
 */
export async function forwardBackendApi(
  apiPath: string,
  options: BackendRequestOptions = {},
): Promise<NextResponse> {
  const response = await fetchBackend(apiPath, options);

  if (!response) {
    return gatewayErrorResponse();
  }

  const text = await response.text();

  const forwarded = new NextResponse(
    text.length > 0 ? text : null,
    {
      status: response.status,
      headers: {
        'content-type':
          response.headers.get('content-type') ??
          'application/json',
      },
    },
  );

  for (const cookie of readSetCookies(
    response.headers,
  )) {
    forwarded.headers.append('set-cookie', cookie);
  }

  return forwarded;
}

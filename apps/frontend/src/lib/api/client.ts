// apps/frontend/src/lib/api/client.ts
import axios from 'axios';

/** Nest 錯誤回應中，本檔會用到的欄位。 */
type ErrorBody = {
  message?: {
    zh?: string;
    en?: string;
  };
};

/**
 * 前端統一使用的 API 錯誤。
 * status 有值：Nest 已回應，例如 401、403、500。
 * status 沒值：可能是逾時或網路連線失敗。
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 瀏覽器端共用的 Axios 實例。
 *
 * '/api' 是網站同來源的路徑，預期由 Nginx 轉送到 Nest。
 * 例如 api.post('/auth/login') 會請求 /api/auth/login。
 */
export const api = axios.create({
  baseURL: '/api',

  // 超過 10 秒仍未收到回應，就中止請求。
  timeout: 10_000,
});

/**
 * 統一處理請求失敗。
 *
 * 成功回應維持 Axios 原本格式；
 * 失敗回應轉成 ApiError，讓表單能直接顯示 error.message。
 */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 不是 Axios 產生的錯誤，就保留原始錯誤。
    if (!axios.isAxiosError<ErrorBody>(error)) {
      return Promise.reject(error);
    }

    // 請求超過 timeout 設定。
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return Promise.reject(new ApiError('請求逾時，請稍後再試'));
    }

    // 沒收到 HTTP 回應，例如斷線或伺服器無法連線。
    if (!error.response) {
      return Promise.reject(new ApiError('無法連線到伺服器'));
    }

    // 優先顯示 Nest 回傳的中文錯誤訊息。
    const message =
      error.response.data?.message?.zh ??
      error.response.data?.message?.en ??
      '操作失敗，請稍後再試';

    // 保留 HTTP 狀態碼，呼叫端可依 401、403 等狀態做處理。
    return Promise.reject(new ApiError(message, error.response.status));
  },
);
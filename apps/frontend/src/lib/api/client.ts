import type {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";

import {
    HTTP_STATUS,
    type ApiErrorResponse,
    type ApiResponse,
} from "@test/shared";

import { env } from "../config/environment";

export const AUTH_SESSION_INVALIDATED_EVENT =
  "auth:session-invalidated" as const;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosConfig: AxiosRequestConfig = {
  baseURL: env.apiUrl,
  timeout: 10_000,
  withCredentials: true,
};

export const api = axios.create(axiosConfig);
let refreshPromise: Promise<void> | null = null;

function isRefreshEligible(config?: RetryableRequestConfig): boolean {
  if (!config || config._retry) return false;

  const url = config.url ?? "";
  return !["/auth/refresh", "/auth/login", "/auth/register"].some((path) =>
    url.endsWith(path),
  );
}

function notifySessionInvalidated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_INVALIDATED_EVENT));
  }
}

function toApiError(error: AxiosError<ApiErrorResponse>): ApiError {
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return new ApiError("請求逾時，請稍後再試");
  }

  if (!error.response) {
    return new ApiError("無法連線到伺服器");
  }

  const body = error.response.data;
  return new ApiError(
    body?.message?.zh ?? body?.message?.en ?? "操作失敗，請稍後再試",
    error.response.status,
    body?.code,
  );
}

api.interceptors.response.use(
  (response) => response,
  async (unknownError: unknown) => {
    if (!axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return Promise.reject(unknownError);
    }

    const error = unknownError;
    const config = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
      isRefreshEligible(config)
    ) {
      config!._retry = true;

      if (!refreshPromise) {
        refreshPromise = api.post("/auth/refresh").then(() => undefined);
      }

      const currentRefresh = refreshPromise;

      try {
        await currentRefresh;
        return await api.request(config!);
      } catch {
        notifySessionInvalidated();
        return Promise.reject(
          new ApiError("登入狀態已失效，請重新登入", HTTP_STATUS.UNAUTHORIZED),
        );
      } finally {
        if (refreshPromise === currentRefresh) {
          refreshPromise = null;
        }
      }
    }

    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      notifySessionInvalidated();
    }

    return Promise.reject(toApiError(error));
  },
);

export function unwrapApiData<T>(response: ApiResponse<T>): T {
  if (response.data === null) {
    throw new ApiError(
      response.message.zh || response.message.en,
      response.statusCode,
    );
  }

  return response.data;
}

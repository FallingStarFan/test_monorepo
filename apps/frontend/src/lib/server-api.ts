import "server-only";

import { cookies } from "next/headers";

import { API_PREFIX, type ApiResponse } from "@test/shared";

export interface ServerApiResult<T> {
  status: number;
  payload: T | null;
}

function resolveBackendUrl(apiPath: string): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!configuredUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_URL");
  }

  const baseUrl = configuredUrl.replace(/\/+$/, "");
  const suffix =
    baseUrl.endsWith(API_PREFIX) && apiPath.startsWith(API_PREFIX)
      ? apiPath.slice(API_PREFIX.length)
      : apiPath;

  return `${baseUrl}${suffix}`;
}

export async function callBackendApi<T>(
  apiPath: string,
): Promise<ServerApiResult<T> | null> {
  try {
    const cookie = (await cookies()).toString();
    const response = await fetch(resolveBackendUrl(apiPath), {
      headers: cookie ? { cookie } : undefined,
      cache: "no-store",
    });
    const envelope = (await response
      .json()
      .catch(() => null)) as ApiResponse<T> | null;

    return {
      status: response.status,
      payload: envelope?.data ?? null,
    };
  } catch {
    return null;
  }
}

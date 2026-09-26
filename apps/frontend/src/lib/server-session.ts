import 'server-only';

import { cookies } from 'next/headers';

import {
  API_PREFIX,
  AUTH_ME_API_PATH,
  DEFAULT_API_PORT,
  HTTP_STATUS,
  MY_PERMISSION_API_PATH,
} from '@test/shared';

import {
  ANONYMOUS_SESSION,
  hasAdminRole,
  type SessionResponse,
  type SessionUser,
} from '@/lib/session';

interface CurrentUserPayload {
  user?: Record<string, unknown>;
}

interface UserAppAccessPayload {
  roleNames?: string[];
  permissionCodes?: string[];
}

function resolveBackendUrl(apiPath: string): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ?? `http://localhost:${DEFAULT_API_PORT}`;
  const origin = configuredUrl.replace(/\/+$/, '').replace(
    new RegExp(`${API_PREFIX}$`),
    '',
  );

  return `${origin}${apiPath}`;
}

async function requestBackend<T>(
  apiPath: string,
  cookie: string,
): Promise<{ status: number; payload: T | null } | null> {
  try {
    const response = await fetch(resolveBackendUrl(apiPath), {
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    return {
      status: response.status,
      payload: (await response.json().catch(() => null)) as T | null,
    };
  } catch {
    return null;
  }
}

function pickSessionUser(user: Record<string, unknown>): SessionUser {
  return {
    id: String(user.id ?? ''),
    email: String(user.email ?? ''),
    name: typeof user.name === 'string' ? user.name : null,
  };
}

/**
 * 將後端 JWT 驗證結果轉成前端 UI 所需的狀態。
 * JWT 永遠保留在 HttpOnly Cookie；這裡不解析或回傳 Token 字串。
 */
export async function getServerSession(): Promise<SessionResponse | null> {
  const cookie = (await cookies()).toString();
  const me = await requestBackend<CurrentUserPayload>(AUTH_ME_API_PATH, cookie);

  if (!me) return null;
  if (me.status === HTTP_STATUS.UNAUTHORIZED) return ANONYMOUS_SESSION;
  if (me.status !== HTTP_STATUS.OK || !me.payload?.user) return null;

  const access = await requestBackend<UserAppAccessPayload>(
    MY_PERMISSION_API_PATH,
    cookie,
  );

  if (!access || access.status !== HTTP_STATUS.OK || !access.payload) {
    return null;
  }

  const roleNames = access.payload.roleNames ?? [];

  return {
    authType: 'jwt',
    authenticated: true,
    user: pickSessionUser(me.payload.user),
    roleNames,
    permissionCodes: access.payload.permissionCodes ?? [],
    isAdmin: hasAdminRole(roleNames),
  };
}

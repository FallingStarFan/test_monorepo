import "server-only";

import {
  AUTH_ME_API_PATH,
  HTTP_STATUS,
  MY_PERMISSION_API_PATH,
  type AuthSessionData,
} from "@test/shared";

import { callBackendApi } from "@/lib/server-api";
import {
  ANONYMOUS_SESSION,
  hasAdminRole,
  type SessionResponse,
} from "@/lib/session";

interface UserAppAccessPayload {
  roleNames: string[];
  permissionCodes: string[];
}

export async function getServerSession(): Promise<SessionResponse | null> {
  const me = await callBackendApi<AuthSessionData>(AUTH_ME_API_PATH);

  if (!me) return null;
  if (me.status === HTTP_STATUS.UNAUTHORIZED) return ANONYMOUS_SESSION;
  if (me.status !== HTTP_STATUS.OK || !me.payload?.user) return null;

  const access = await callBackendApi<UserAppAccessPayload>(
    MY_PERMISSION_API_PATH,
  );

  if (!access || access.status !== HTTP_STATUS.OK || !access.payload) {
    return null;
  }

  const roleNames = access.payload.roleNames ?? [];

  return {
    authType: "jwt",
    authenticated: true,
    user: {
      id: me.payload.user.id,
      email: me.payload.user.email,
      name: me.payload.user.name,
    },
    roleNames,
    permissionCodes: access.payload.permissionCodes ?? [],
    isAdmin: hasAdminRole(roleNames),
  };
}

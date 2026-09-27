import { SYSTEM_ROLE_ADMIN, type AuthUser } from "@test/shared";

export type SessionUser = Pick<AuthUser, "id" | "email" | "name">;

export interface SessionResponse {
  authType: "jwt" | "anonymous";
  authenticated: boolean;
  user: SessionUser | null;
  roleNames: string[];
  permissionCodes: string[];
  isAdmin: boolean;
}

export const ANONYMOUS_SESSION: SessionResponse = {
  authType: "anonymous",
  authenticated: false,
  user: null,
  roleNames: [],
  permissionCodes: [],
  isAdmin: false,
};

export function hasAdminRole(roleNames: readonly string[]): boolean {
  return roleNames.includes(SYSTEM_ROLE_ADMIN);
}

export function resolveDisplayName(user: SessionUser | null): string {
  if (!user) return "訪客";
  return user.name?.trim() || user.email || "使用者";
}

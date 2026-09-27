"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AUTH_SESSION_INVALIDATED_EVENT,
  getAuthMe,
  getMyPermissions,
  logout,
} from "@/lib/api";
import {
  ANONYMOUS_SESSION,
  hasAdminRole,
  type SessionResponse,
} from "@/lib/session";

type SessionStatus = "loading" | "ready";

interface SessionContextValue {
  session: SessionResponse;
  status: SessionStatus;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode;
  initialSession?: SessionResponse | null;
}) {
  const [session, setSession] = useState<SessionResponse>(
    initialSession ?? ANONYMOUS_SESSION,
  );
  const [status, setStatus] = useState<SessionStatus>(
    initialSession ? "ready" : "loading",
  );

  const refresh = useCallback(async () => {
    try {
      const [auth, permissions] = await Promise.all([
        getAuthMe(),
        getMyPermissions(),
      ]);
      const roleNames = permissions.roleNames ?? [];

      setSession({
        authType: "jwt",
        authenticated: true,
        user: {
          id: auth.user.id,
          email: auth.user.email,
          name: auth.user.name,
        },
        roleNames,
        permissionCodes: permissions.permissionCodes ?? [],
        isAdmin: hasAdminRole(roleNames),
      });
    } catch {
      setSession(ANONYMOUS_SESSION);
    } finally {
      setStatus("ready");
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      setSession(ANONYMOUS_SESSION);
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    if (!initialSession) void refresh();
  }, [initialSession, refresh]);

  useEffect(() => {
    const invalidate = () => {
      setSession(ANONYMOUS_SESSION);
      setStatus("ready");
    };

    window.addEventListener(AUTH_SESSION_INVALIDATED_EVENT, invalidate);
    return () => {
      window.removeEventListener(AUTH_SESSION_INVALIDATED_EVENT, invalidate);
    };
  }, []);

  const value = useMemo(
    () => ({ session, status, refresh, signOut }),
    [session, status, refresh, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession 必須在 SessionProvider 內使用");
  }

  return context;
}

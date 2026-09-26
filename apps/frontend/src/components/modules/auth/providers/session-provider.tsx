'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AUTH_LOGOUT_BFF_PATH,
  AUTH_SESSION_BFF_PATH,
} from '@test/shared';

import {
  ANONYMOUS_SESSION,
  type SessionResponse,
} from '@/lib/session';

/**
 * 全站登入狀態來源。
 *
 * 為什麼要放在 Provider 而不是讓各元件自己打 API：
 * 頁首（要不要顯示登出）、側邊導覽（要不要顯示「控制台」）都依賴同一份狀態，
 * 各自請求會出現「導覽已隱藏、頁首還顯示已登入」這類不一致的畫面。
 *
 * 為什麼初始值由伺服器端帶入（initialSession）：
 * layout 在輸出 HTML 前已經問過後端一次，直接沿用可讓第一次畫面就正確，
 * 不會出現「先隱藏控制台、載入後才冒出來」的閃動。
 *
 * 為什麼狀態一律來自 BFF，而不是在前端自行解讀 Cookie：
 * Access Token 是 HttpOnly，瀏覽器讀不到也不該讀；
 * 由 `/api/auth/session` 回傳後端已驗證過的結果，前端只負責呈現。
 */
type SessionStatus = 'loading' | 'ready';

interface SessionContextValue {
  session: SessionResponse;
  status: SessionStatus;
  /** 重新向 BFF 取得登入狀態（登入或登出後呼叫）。 */
  refresh: () => Promise<void>;
  /** 登出：由 BFF 轉發後端的 logout，讓後端清除 Cookie。 */
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode;
  /** 伺服器端已取得的登入狀態；後端連不上時為 null。 */
  initialSession?: SessionResponse | null;
}) {
  const [session, setSession] = useState<SessionResponse>(
    initialSession ?? ANONYMOUS_SESSION,
  );
  const [status, setStatus] = useState<SessionStatus>(
    initialSession ? 'ready' : 'loading',
  );

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(AUTH_SESSION_BFF_PATH, {
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (!response.ok) {
        setSession(ANONYMOUS_SESSION);
        return;
      }

      const payload = (await response
        .json()
        .catch(() => null)) as SessionResponse | null;

      setSession(payload ?? ANONYMOUS_SESSION);
    } catch {
      // 前端服務或後端暫時連不上時，先以「未登入」呈現，
      // 避免畫面停在載入中而讓使用者以為網站壞了。
      setSession(ANONYMOUS_SESSION);
    } finally {
      setStatus('ready');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch(AUTH_LOGOUT_BFF_PATH, {
        method: 'POST',
        credentials: 'same-origin',
      });
    } finally {
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    // 已經有伺服器端結果時不再重問一次；
    // 後端連不上（initialSession 為 null）才由瀏覽器補一次。
    if (initialSession) {
      return;
    }

    void refresh();
  }, [initialSession, refresh]);

  const value = useMemo(
    () => ({ session, status, refresh, signOut }),
    [session, status, refresh, signOut],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

/** 取得登入狀態；必須在 SessionProvider 之內使用。 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      'useSession 必須在 SessionProvider 內使用',
    );
  }

  return context;
}

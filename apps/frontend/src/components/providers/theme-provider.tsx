'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * 主題（淺色／深色／跟隨系統）。
 *
 * 不引入額外的主題套件，是因為需求僅有切換 .dark 類別這一點，
 * 以此規模自行實作可少一個依賴，也避免套件改版造成升級負擔。
 */

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'test-monorepo.theme.v1';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** 依系統偏好決定實際主題，供「跟隨系統」模式使用。 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') {
    return theme;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;

    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const resolved = resolveTheme(theme);

    document.documentElement.classList.toggle('dark', resolved === 'dark');
    setResolvedTheme(resolved);

    // 「跟隨系統」模式下，使用者的系統設定可能在瀏覽器開啟期間改變，
    // 因此需要監聽事件，否則畫面會停留在舊的主題。
    if (theme !== 'system') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = media.matches ? 'dark' : 'light';

      document.documentElement.classList.toggle('dark', next === 'dark');
      setResolvedTheme(next);
    };

    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** 取得主題狀態；必須在 ThemeProvider 之內使用。 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme 必須在 ThemeProvider 內使用');
  }

  return context;
}

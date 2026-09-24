'use client';

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from 'next-themes';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="test-monorepo.theme.v1"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme(): ThemeContextValue {
  const { theme, resolvedTheme, setTheme } = useNextTheme();

  return {
    theme: (theme ?? 'system') as Theme,
    resolvedTheme: resolvedTheme === 'dark' ? 'dark' : 'light',
    setTheme: (theme) => setTheme(theme),
  };
}
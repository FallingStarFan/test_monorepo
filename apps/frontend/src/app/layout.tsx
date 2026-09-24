import type { Metadata } from 'next';

import './globals.css';

import { AppShell } from '@/components/layout/app-shell';
import { SessionProvider } from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { UiScaleProvider } from '@/components/providers/ui-scale-provider';
import { getServerSession } from '@/lib/server-session';

export const metadata: Metadata = {
  title: {
    default: 'XingFan Studio',
    template: '%s | XingFan Studio',
  },
  description: 'XingFan Studio 系列產品與服務總入口。',
};

/**
 * 於畫面繪製前先套用主題與縮放。
 *
 * 這段程式必須在 HTML 產生時同步執行，否則使用者會先看到預設主題與尺寸，
 * 接著才被 JS 修正，產生俗稱的閃爍（FOUC）。
 */
const bootstrapScript = `
(function () {
  try {
    var storedTheme = localStorage.getItem('test-monorepo.theme.v1');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = storedTheme === 'dark' || (storedTheme !== 'light' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);

    var storedScale = parseFloat(localStorage.getItem('test-monorepo.ui-scale.v1') || '1');
    if (!isNaN(storedScale) && storedScale > 0) {
      document.documentElement.style.fontSize = (16 * storedScale) + 'px';
    }
  } catch (error) {
    /* 使用者若停用 localStorage，仍應能正常瀏覽，故忽略錯誤。 */
  }
})();
`;

/**
 * 根版面。
 *
 * 這裡先向後端問一次登入狀態再輸出畫面：導覽與頁首的顯示條件都依賴它，
 * 由伺服器端帶 Cookie 取得，瀏覽器端就不會出現「先錯後對」的閃動。
 * 後端連不上時傳 null，讓 SessionProvider 改由瀏覽器重試。
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    // suppressHydrationWarning：html 的 class 與 style 會在瀏覽器端由上述指令碼先行設定，
    // 與伺服器輸出必然不同，這是刻意的，不需要警告。
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body>
        <ThemeProvider>
          <UiScaleProvider>
            <SessionProvider initialSession={session}>
              <AppShell>{children}</AppShell>
            </SessionProvider>
          </UiScaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

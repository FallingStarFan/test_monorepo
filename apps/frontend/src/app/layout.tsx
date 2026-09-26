import type { Metadata } from 'next';

import './globals.css';

import { AppShellBase } from '@/components/layout/app-shell';
import { SessionProvider } from '@/components/modules/auth/providers';
import { ThemeProvider } from '@/components/base/providers/theme-provider';
import { UiScaleProvider } from '@/components/base/providers/ui-scale-provider';
import { getServerSession } from '@/lib/server-session';

export const metadata: Metadata = {
  title: {
    default: 'XingFan Studio',
    template: '%s | XingFan Studio',
  },
  description: 'XingFan Studio 系列產品與服務總入口。',
};

/**
 * 於畫面繪製前先套用 UI 縮放。
 *
 * 這段程式必須在 HTML 產生時同步執行，否則使用者會先看到預設主題與尺寸，
 * 接著才被 JS 修正，產生俗稱的閃爍（FOUC）。
 */
const uiScaleBootstrapScript = `
(function () {
  try {
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
    // suppressHydrationWarning：html 的 class 會由 next-themes、style 會由上述縮放指令碼在瀏覽器端設定，
    // 與伺服器輸出必然不同，這是刻意的，不需要警告。
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: uiScaleBootstrapScript }} />
      </head>
      <body>
        <ThemeProvider>
          <UiScaleProvider>
            <SessionProvider initialSession={session}>
              <AppShellBase>{children}</AppShellBase>
            </SessionProvider>
          </UiScaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

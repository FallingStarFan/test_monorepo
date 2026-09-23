"use client"

import { LOGIN_PAGE_PATH } from '@test/shared';
import { LogIn, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { UiScaleControls } from '@/components/layout/ui-scale-controls';
import { useSession } from '@/components/providers/session-provider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { findNavItem } from '@/lib/navigation';
import { resolveDisplayName } from '@/lib/session';

/**
 * 頁首。
 *
 * 標題直接由導覽設定推導，新增頁面時不必再各自維護標題文字，
 * 也就不會出現選單名稱與頁面標題不一致的情況。
 *
 * 右側為登入狀態：尚未取得狀態時顯示檢查中，未登入時提供登入入口，
 * 已登入時顯示帳號與登出。登出交由 BFF 轉發後端，讓後端清除 HttpOnly Cookie。
 */
export function Header({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();
  const current = findNavItem(pathname);
  const { session, status, signOut } = useSession();

  const displayName = resolveDisplayName(session.user);

  return (
    <header className="sticky top-0 z-30 flex h-header items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={onOpenNav}
        aria-label="開啟導覽選單"
      >
        <Menu className="size-4" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold sm:text-base">
          {current?.label ?? '頁面不存在'}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {current?.description ?? '此路徑沒有對應的模組頁面'}
        </p>
      </div>

      {/* 小螢幕空間有限，縮放控制改由「設定」頁提供，以免擠壓標題。 */}
      <UiScaleControls className="hidden sm:flex" />
      <ThemeToggle />

      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      <div className="flex items-center gap-2">
        {status === 'loading' ? (
          <span className="text-xs text-muted-foreground">
            檢查登入狀態…
          </span>
        ) : session.authenticated ? (
          <>
            <span
              title={displayName}
              className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold"
            >
              {displayName.slice(0, 1)}
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="max-w-40 truncate text-xs font-medium">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {session.isAdmin ? 'ADMIN' : '一般使用者'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void signOut();
              }}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">登出</span>
            </Button>
          </>
        ) : (
          <>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              尚未登入
            </span>
            <Button size="sm" asChild>
              <Link href={LOGIN_PAGE_PATH}>
                <LogIn className="size-4" />
                登入
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

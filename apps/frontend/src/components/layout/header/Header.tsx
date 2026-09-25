"use client";

import { LOGIN_PAGE_PATH } from "@test/shared";
import { LogIn, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UiScaleControls } from "@/components/layout/ui-scale-controls";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { findNavItem } from "@/lib/navigation";
import { resolveDisplayName } from "@/lib/session";

type HeaderProps = {
  hasSidebar?: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
};

export function Header({
  hasSidebar = true,
  sidebarOpen,
  onToggleSidebar,
  onOpenMobileNav,
}: HeaderProps) {
  const pathname = usePathname();
  const current = findNavItem(pathname);
  const { session, status, signOut } = useSession();
  const displayName = resolveDisplayName(session.user);

  return (
    <header className="sticky top-0 z-30 flex h-header items-center gap-3 border-b bg-background/95 px-3 backdrop-blur sm:px-6">
     <div className="flex min-w-0 flex-1 items-center gap-3">
      
        {hasSidebar && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onOpenMobileNav}
            aria-label="開啟導覽選單"
          >
            <Menu className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden shrink-0 lg:inline-flex"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? '收合側邊欄' : '展開側邊欄'}
            aria-expanded={sidebarOpen}
            aria-controls="desktop-sidebar"
          >
            <Menu className="size-4" />
          </Button>
        </>
      )}

  <div className="min-w-0">
    <h1 className="truncate text-sm font-semibold sm:text-base">
      {current?.label ?? '頁面不存在'}
    </h1>
    <p className="hidden truncate text-xs text-muted-foreground sm:block">
      {current?.description ?? '此路徑沒有對應的頁面'}
    </p>
  </div>
</div>

      <UiScaleControls className="hidden sm:flex" />
      <ThemeToggle />

      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      <div className="flex items-center gap-2">
        {status === "loading" ? (
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
                {session.isAdmin ? "ADMIN" : "一般使用者"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut()}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">登出</span>
            </Button>
          </>
        ) : (
          <Button size="sm" asChild>
            <Link href={LOGIN_PAGE_PATH}>
              <LogIn className="size-4" />
              登入
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
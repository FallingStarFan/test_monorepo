'use client';

import { useState, type ReactNode } from 'react';

import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type AppShellBaseProps = {
  sidebar?: ReactNode;
  children: ReactNode;
};


export function AppShellBase({ sidebar, children }: AppShellBaseProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavOpen, setDesktopNavOpen] = useState(true);

  return (
    <div className="min-h-screen bg-muted/30 mx-auto w-[95%]">
     {/* 1. 桌面側欄 */}
      {sidebar && (
        <aside
          id="desktop-sidebar"
          aria-hidden={!desktopNavOpen}
          className={[
            'fixed inset-y-0 left-0 z-20 hidden w-sidebar overflow-hidden border-r bg-background',
            'transition-transform duration-300 ease-in-out motion-reduce:transition-none lg:block',
            desktopNavOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          {sidebar}
        </aside>
      )}

      {/* 2. 只有側欄存在且展開時，才保留左側寬度 */}
      <div
        className={[
          'flex min-h-screen flex-col',
          'transition-[padding-left] duration-300 ease-in-out motion-reduce:transition-none',
          sidebar && desktopNavOpen ? 'lg:pl-sidebar' : 'lg:pl-0',
        ].join(' ')}
      >
        <Header
          hasSidebar={!!sidebar}
          sidebarOpen={desktopNavOpen}
          onToggleSidebar={() => setDesktopNavOpen((open) => !open)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 pt-6">
          {/* 3. 沒側欄時，main 內容佔可用寬度的 95% */}
          <div
            className={
              sidebar
                ? 'content-shell'
                : 'mx-auto w-[95%]'
            }
          >
            {children}
          </div>
        </main>

        <footer className="border-t bg-background px-4 py-4 text-center text-xs text-muted-foreground">
          test_monorepo：NestJS 後端（apps/backend）與 Next.js 前端（apps/frontend）共用
          packages/shared 的型別與常數。
        </footer>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-sidebar p-0 sm:max-w-none">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle>導覽</SheetTitle>
            <SheetDescription>選擇要前往的模組頁面</SheetDescription>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
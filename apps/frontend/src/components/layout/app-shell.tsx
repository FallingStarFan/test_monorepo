'use client';

import { useState } from 'react';

import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

/**
 * 全站版面骨架。
 *
 * 版面採「固定側欄 + 內容區」的經典後台結構：桌面版側欄常駐，
 * 行動版收進可滑出的面板，兩者共用同一份導覽定義以避免內容不同步。
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar border-r bg-background lg:flex">
        <SidebarNav />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-sidebar">
        <Header onOpenNav={() => setNavOpen(true)} />

        <main className="flex-1">
          <div className="content-shell">{children}</div>
        </main>

        <footer className="border-t bg-background px-4 py-4 text-center text-xs text-muted-foreground">
          test_monorepo：NestJS 後端（apps/backend）與 Next.js 前端（apps/frontend）共用
          packages/shared 的型別與常數。
        </footer>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        {/* 行動版面板寬度與桌機側欄一致，切換尺寸時導覽位置不會跳動。 */}
        <SheetContent side="left" className="w-sidebar p-0 sm:max-w-none">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle>導覽</SheetTitle>
            <SheetDescription>選擇要前往的模組頁面</SheetDescription>
          </SheetHeader>
          <SidebarNav onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

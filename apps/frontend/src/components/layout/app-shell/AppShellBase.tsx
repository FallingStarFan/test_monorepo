'use client';

import { useState, type ReactNode } from 'react';

import {
  FooterBase,
  Header,
  ModalRenderer,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SidebarNav,
} from '@/components';

type AppShellBaseProps = {
  sidebar?: ReactNode;
  children: ReactNode;
};

export function AppShellBase({ sidebar, children }: AppShellBaseProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavOpen, setDesktopNavOpen] = useState(true);

  return (
    <div className="min-h-screen bg-muted/30">
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

      <div
        className={[
          'flex min-h-screen min-w-0 flex-col',
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

        <main className="min-w-0 flex-1 pt-6">
          <div className={sidebar ? 'content-shell' : 'mx-auto w-[95%]'}>
            {children}
             <ModalRenderer />
          </div>
        </main>

        <FooterBase />
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
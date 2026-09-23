'use client';

import { Boxes } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useSession } from '@/components/providers/session-provider';
import { visibleNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

/**
 * 側邊導覽。
 *
 * 桌面版與行動版共用同一個元件，只在容器寬度與點擊後行為上不同，
 * 避免兩份幾乎相同的選單各自演進而出現導覽不一致。
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { session } = useSession();

  // 依登入狀態過濾項目：ADMIN 專屬的「控制台」對未登入與非 ADMIN 不顯示。
  // 登入狀態尚未載入完成時也先視為非 ADMIN（避免先出現再消失的閃動）。
  const items = visibleNavItems(session.isAdmin);

  return (
    <nav className="flex h-full flex-col gap-2 p-4" aria-label="主導覽">
      <div className="mb-2 flex items-center gap-2 px-2 py-1">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Boxes className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">test_monorepo</p>
          <p className="text-xs text-muted-foreground">全端控制台</p>
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-auto px-3 text-xs leading-relaxed text-muted-foreground">
        權限、帳務與 Canvas 白板頁面將在對應後端模組完成後加入此處。
      </p>
    </nav>
  );
}

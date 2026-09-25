import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * 載入佔位區塊。
 *
 * 以與實際內容相近的形狀佔位，可避免資料載入完成時版面大幅跳動，
 * 使用者也較容易理解「這裡即將出現內容」而非空白畫面。
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

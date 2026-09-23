import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * 文字輸入框。
 *
 * 直接綁定原生 input 而不自行封裝 value/onChange，
 * 是因為原生元素已能與表單、無障礙與瀏覽器自動填入完整配合，
 * 額外抽象只會讓這些行為失效。
 */
export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

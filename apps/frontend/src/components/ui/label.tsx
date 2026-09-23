'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * 表單標籤。
 *
 * 使用 Radix 的 Label 而非原生 label，是因為它會正確處理點擊標籤時的焦點轉移，
 * 且與各種自訂輸入元件的 htmlFor 關聯更穩定。
 */
export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}

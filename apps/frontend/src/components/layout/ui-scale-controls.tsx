'use client';

import { Minus, Plus, RotateCcw } from 'lucide-react';

import { useUiScale } from '@/components/providers/ui-scale-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 全域 UI 縮放控制。
 *
 * 提供按鈕而不只依賴瀏覽器內建的頁面縮放，是因為瀏覽器縮放會連帶放大
 * 圖片與固定版面，這裡只調整以 rem 為單位的介面尺寸，版面結構維持一致。
 */
export function UiScaleControls({ className }: { className?: string }) {
  const { scale, increase, decrease, reset, canIncrease, canDecrease } =
    useUiScale();

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-md border bg-background p-0.5',
        className,
      )}
      title="介面縮放（Ctrl/⌘ 搭配 +、-、0）"
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={decrease}
        disabled={!canDecrease}
        aria-label="縮小介面"
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">
        {Math.round(scale * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={increase}
        disabled={!canIncrease}
        aria-label="放大介面"
      >
        <Plus className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={reset}
        aria-label="重設介面縮放"
      >
        <RotateCcw className="size-3.5" />
      </Button>
    </div>
  );
}

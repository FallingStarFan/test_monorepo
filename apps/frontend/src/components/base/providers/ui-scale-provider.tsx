'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * 全域 UI 縮放。
 *
 * 選擇以 html 的 font-size 作為縮放基準，而不是對整個 App 套 CSS transform：
 * transform 會讓子元素的 position: fixed 參照改變，也會產生模糊的文字與滾動問題；
 * 調整根字級則能讓所有以 rem 定義的 Tailwind 尺寸一起等比縮放。
 */

/** 可選縮放級距（1 = 100%）。 */
export const UI_SCALE_STEPS = [0.75, 0.875, 1, 1.125, 1.25, 1.5] as const;

/** 瀏覽器預設根字級，縮放計算皆以此為基準。 */
const BASE_FONT_SIZE = 18;

/**
 * localStorage 的鍵名。
 *
 * 加上版本後綴，日後若要改動級距定義即可換鍵名，
 * 使用者不會因為舊資料而載入到不存在的級距值。
 */
const STORAGE_KEY = 'test-monorepo.ui-scale.v1';

interface UiScaleContextValue {
  /** 目前縮放倍率。 */
  scale: number;
  /** 是否還能放大／縮小，供按鈕停用狀態使用。 */
  canIncrease: boolean;
  canDecrease: boolean;
  setScale: (scale: number) => void;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
}

const UiScaleContext = createContext<UiScaleContextValue | null>(null);

/** 找出最接近傳入值的合法級距，避免外部傳入任意數字而讓畫面比例失衡。 */
function normalizeScale(value: number): number {
  return UI_SCALE_STEPS.reduce((closest, step) =>
    Math.abs(step - value) < Math.abs(closest - value) ? step : closest,
  );
}

export function UiScaleProvider({ children }: { children: React.ReactNode }) {
  // 初始值固定為 1，實際值於瀏覽器端讀取 localStorage 後再套用，
  // 否則伺服器與瀏覽器輸出的 HTML 不一致會造成 hydration 錯誤。
  const [scale, setScaleState] = useState<number>(1);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = Number.parseFloat(stored);

      if (!Number.isNaN(parsed)) {
        setScaleState(normalizeScale(parsed));
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${BASE_FONT_SIZE * scale}px`;
  }, [scale]);

  const setScale = useCallback((next: number) => {
    const normalized = normalizeScale(next);

    setScaleState(normalized);
    window.localStorage.setItem(STORAGE_KEY, String(normalized));
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      setScaleState((current) => {
        const index = UI_SCALE_STEPS.indexOf(
          current as (typeof UI_SCALE_STEPS)[number],
        );
        // 找不到目前級距時（例如舊資料）退回預設級距，確保計算不會出現 -1 索引。
        const safeIndex = index === -1 ? UI_SCALE_STEPS.indexOf(1) : index;
        const nextIndex = Math.min(
          Math.max(safeIndex + direction, 0),
          UI_SCALE_STEPS.length - 1,
        );
        const next = UI_SCALE_STEPS[nextIndex] ?? 1;

        window.localStorage.setItem(STORAGE_KEY, String(next));

        return next;
      });
    },
    [],
  );

  const increase = useCallback(() => step(1), [step]);
  const decrease = useCallback(() => step(-1), [step]);
  const reset = useCallback(() => setScale(1), [setScale]);

  /**
   * 鍵盤快捷鍵：Ctrl/Command 加上 +、-、0。
   *
   * 同時提供按鈕與快捷鍵，是因為縮放屬於高頻操作，
   * 使用者若需反覆調整，用快捷鍵比每次移動滑鼠到工具列更有效率。
   */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      if (event.key === '=' || event.key === '+') {
        event.preventDefault();
        increase();
      } else if (event.key === '-') {
        event.preventDefault();
        decrease();
      } else if (event.key === '0') {
        event.preventDefault();
        reset();
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [increase, decrease, reset]);

  const value = useMemo<UiScaleContextValue>(() => {
    const index = UI_SCALE_STEPS.indexOf(
      scale as (typeof UI_SCALE_STEPS)[number],
    );

    return {
      scale,
      canIncrease:
        index !== -1 && index < UI_SCALE_STEPS.length - 1,
      canDecrease: index > 0,
      setScale,
      increase,
      decrease,
      reset,
    };
  }, [scale, setScale, increase, decrease, reset]);

  return (
    <UiScaleContext.Provider value={value}>{children}</UiScaleContext.Provider>
  );
}

/** 取得全域縮放狀態；必須在 UiScaleProvider 之內使用。 */
export function useUiScale() {
  const context = useContext(UiScaleContext);

  if (!context) {
    throw new Error('useUiScale 必須在 UiScaleProvider 內使用');
  }

  return context;
}

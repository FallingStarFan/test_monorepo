import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 Tailwind 類別名稱。
 *
 * 直接字串串接時，後出現的類別不一定會覆蓋先前的（例如同時出現 p-2 與 p-4），
 * 這會讓「由外部傳入 className 覆蓋元件樣式」的慣用寫法失效，
 * 因此統一透過 tailwind-merge 處理衝突。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

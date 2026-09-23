import { CANVAS_APP_NAME, LAUNCHER_PAGE_PATH } from '@test/shared';
import { Frame, Wrench } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Canvas 白板頁（入口佔位）。
 *
 * 為什麼先建立這一頁：
 * 資料庫的 apps 表已經有 canvas 這一列，入口頁就會畫出 Canvas 卡片；
 * 若沒有對應頁面，使用者一點就得到 404——入口頁顯示了「進得去」的入口，
 * 實際上卻是死路，比不出現更糟。
 *
 * 這裡刻意不放任何假的畫布功能：沒有後端支援的畫布只會誤導使用者，
 * 因此只說明現況與下一步，並提供回到 App 入口的路徑。
 */
export default function CanvasPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Frame className="size-4" />
            Canvas 白板
          </CardTitle>
          <CardDescription>
            這個 App 的入口已建立，白板功能尚在開發中；畫面不會有可編輯的畫布。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p className="leading-relaxed">
            已完成的部份：資料庫 apps 表中的{' '}
            <span className="font-mono text-xs">{CANVAS_APP_NAME}</span>{' '}
            資料列、入口頁的卡片，以及這個頁面本身。
            尚未完成的部份：畫布編輯、儲存與協作，待後端模組完成後接上。
          </p>
          <div className="flex items-center gap-2">
            <Wrench className="size-4" />
            <span>開發中：功能與資料尚未開放。</span>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link href={LAUNCHER_PAGE_PATH}>回到 App 入口</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

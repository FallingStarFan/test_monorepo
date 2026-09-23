import { Compass } from 'lucide-react';
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
 * 找不到頁面。
 *
 * 保留導覽列與返回入口，讓使用者能自行回到可用頁面，
 * 而不是停在瀏覽器預設的死路畫面。
 */
export default function NotFound() {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="size-4" />
          找不到這個頁面
        </CardTitle>
        <CardDescription>
          路徑可能已變更，或對應的模組頁面尚未建立。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/">回到總覽</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

import { ServerCrash } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * 共用提示卡。
 *
 * 為什麼抽成共用元件：
 * 「未登入」、「權限不足」、「後端連不上」這幾種狀態在 App 入口頁與控制台
 * 都會出現，若各自在頁面裡實作一份，同一種狀態就會有兩種版面與兩種說法，
 * 使用者看到的不一致等於讓人不確定自己到底遇到哪一種問題。
 */
export function NoticeCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}

/**
 * 後端連不上時顯示的內容。
 *
 * 「連不上」與「沒權限」必須分開講：把連線失敗誤報成權限不足，
 * 會讓使用者去要一個他其實已經有的權限。
 */
export function BackendUnavailableCard() {
  return (
    <NoticeCard
      icon={<ServerCrash className="size-4" />}
      title="無法連線到後端服務"
      description="前端已啟動，但讀不到後端資料。請確認 apps/backend（預設 http://localhost:3013）是否正在執行，稍後重新整理即可。"
    />
  );
}

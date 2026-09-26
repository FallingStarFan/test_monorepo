import type { ReactNode } from 'react';
import { ServerCrash } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './Card';

interface NoticeCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
}

/** 用於登入、權限與服務連線狀態的共用提示卡。 */
export function NoticeCard({ icon, title, description, children }: NoticeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}

export function BackendUnavailableCard() {
  return (
    <NoticeCard
      icon={<ServerCrash className="size-4" />}
      title="無法連線到後端服務"
      description="前端已啟動，但讀不到後端資料。請確認 apps/backend（預設 http://localhost:3013）是否正在執行，稍後重新整理即可。"
    />
  );
}

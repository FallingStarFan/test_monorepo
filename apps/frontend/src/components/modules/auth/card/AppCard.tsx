import type { App } from '@test/shared';
import { AppWindow } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/base/card';

export function AppCard({ app }: { app: App }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AppWindow className="size-4" />
          {app.name}
        </CardTitle>
        <CardDescription>{app.description ?? '（這個 App 尚未填寫說明）'}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span className="break-all font-mono">{app.id}</span>
        <span>建立於 {formatDate(app.createdAt)}</span>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string | undefined): string {
  if (!value) return '未知';
  return value.length >= 10 ? value.slice(0, 10) : value;
}

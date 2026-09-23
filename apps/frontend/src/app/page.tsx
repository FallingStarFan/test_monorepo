import {
  ADMIN_APPS_API_PATH,
  AUTH_ME_API_PATH,
  HTTP_STATUS,
  LOGIN_PAGE_PATH,
  MY_PERMISSION_API_PATH,
  SYSTEM_ROLE_ADMIN,
  type App,
} from '@test/shared';
import {
  AppWindow,
  LayoutGrid,
  ServerCrash,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { callBackendApi } from '@/lib/bff';

/**
 * 控制台（首頁）。
 *
 * 這裡回答的問題只有一個：「目前有哪些 App」，
 * 因此畫面是一張 App 一張卡片，資料一律來自後端 `/api/admin/apps`，
 * 不再由前端維護一份寫死的模組清單（寫死的清單會在後端新增 App 後默默過期）。
 *
 * 為什麼是伺服器元件：
 * 需要的資料（登入狀態、角色、App 清單）都在後端，且存取需要 HttpOnly Cookie，
 * 由伺服器端帶 Cookie 取得後再渲染，瀏覽器既拿不到 Token，也不會出現「先渲染再補資料」的空窗。
 *
 * 三種情境的處理順序：
 * 1. 未登入 → 只顯示「請先登入」，不顯示任何 App 資料。
 * 2. 已登入但非 ADMIN → 只顯示權限不足提示，同樣看不到 App 資料。
 * 3. ADMIN → 才向後端取 App 清單並以卡片呈現。
 */
export const dynamic = 'force-dynamic';

interface CurrentUserPayload {
  user?: {
    id?: string;
    email?: string;
    name?: string | null;
  };
}

interface AppAccessPayload {
  roleNames?: string[];
  permissionCodes?: string[];
}

/** 後端連不上時顯示的內容（連不上與「沒權限」是兩件事，必須分開講）。 */
function BackendUnavailableCard() {
  return (
    <NoticeCard
      icon={<ServerCrash className="size-4" />}
      title="無法連線到後端服務"
      description="前端已啟動，但讀不到後端資料。請確認 apps/backend（預設 http://localhost:3013）是否正在執行，稍後重新整理即可。"
    />
  );
}

/** 共用提示卡，統一未登入、權限不足與連線失敗三種狀態的版面。 */
function NoticeCard({
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

/** 只取日期部分，避免伺服器與瀏覽器時區不同造成畫面不一致。 */
function formatDate(value: string | undefined): string {
  if (!value) {
    return '未知';
  }

  return value.length >= 10 ? value.slice(0, 10) : value;
}

export default async function DashboardPage() {
  const me = await callBackendApi<CurrentUserPayload>(
    AUTH_ME_API_PATH,
  );

  if (!me) {
    return <BackendUnavailableCard />;
  }

  // 情境一：未登入。
  if (
    me.status === HTTP_STATUS.UNAUTHORIZED ||
    !me.payload?.user
  ) {
    return (
      <NoticeCard
        icon={<ShieldAlert className="size-4" />}
        title="請先登入"
        description="控制台只開放給 public-service 的 ADMIN，登入後才會顯示 App 清單。"
      >
        <Button asChild>
          <Link href={LOGIN_PAGE_PATH}>前往登入</Link>
        </Button>
      </NoticeCard>
    );
  }

  const access = await callBackendApi<AppAccessPayload>(
    MY_PERMISSION_API_PATH,
  );
  const roleNames = access?.payload?.roleNames ?? [];

  // 情境二：已登入但不是 ADMIN。
  if (!roleNames.includes(SYSTEM_ROLE_ADMIN)) {
    return (
      <NoticeCard
        icon={<ShieldAlert className="size-4" />}
        title="需要 ADMIN 權限"
        description={`目前登入的帳號（${me.payload.user.email ?? '未知帳號'}）沒有 public-service 的 ADMIN 角色，因此不顯示 App 清單。若需要瀏覽，請聯絡管理員指派角色。`}
      />
    );
  }

  // 情境三：ADMIN，向後端取 App 清單。
  const appsResult = await callBackendApi<App[]>(
    ADMIN_APPS_API_PATH,
  );

  if (!appsResult) {
    return <BackendUnavailableCard />;
  }

  if (appsResult.status === HTTP_STATUS.FORBIDDEN) {
    return (
      <NoticeCard
        icon={<ShieldAlert className="size-4" />}
        title="權限不足"
        description="已具備 ADMIN 角色，但缺少讀取 App 清單所需的權限碼（APP_READ）。請聯絡管理員確認角色權限設定。"
      />
    );
  }

  if (appsResult.status !== HTTP_STATUS.OK) {
    return (
      <NoticeCard
        icon={<ServerCrash className="size-4" />}
        title="讀取 App 清單失敗"
        description={`後端回傳 HTTP ${appsResult.status}，請稍後再試或查看後端日誌。`}
      />
    );
  }

  const apps = Array.isArray(appsResult.payload)
    ? appsResult.payload
    : [];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          ADMIN 檢視
        </Badge>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          目前有哪些 App
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          以下卡片由後端{' '}
          <span className="font-mono text-xs">{ADMIN_APPS_API_PATH}</span>{' '}
          即時取得，每個 App 一張卡片；不再由前端維護寫死的清單。
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" />
          以 {me.payload.user.email ?? '目前帳號'} 的 ADMIN 身分檢視
        </div>
      </section>

      {apps.length === 0 ? (
        <NoticeCard
          icon={<LayoutGrid className="size-4" />}
          title="目前沒有任何 App"
          description="後端的 App 資料表是空的。新增 App 後重新整理此頁即可看到卡片。"
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AppWindow className="size-4" />
                  {app.name}
                </CardTitle>
                <CardDescription>
                  {app.description ?? '（這個 App 尚未填寫說明）'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="break-all font-mono">{app.id}</span>
                <span>建立於 {formatDate(app.createdAt)}</span>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

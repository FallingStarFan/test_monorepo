import { Bell } from "lucide-react";

import { Badge } from "@/components/base/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/base/card";
import { Separator } from "@/components/base/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/base/tabs";
type AppNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  linkPath: string;
  actorUserId: string | null;
  actorLabel: string | null;
  readAt: string | null;
  createdAt: string;
};

/**
 * 通知模組頁面（骨架）。
 *
 * 以「全部 / 未讀」兩個頁籤呈現，是因為未讀數量是用戶最常關心的資訊，
 * 若只提供單一列表，使用者得自行掃描才能判斷是否有新通知。
 *
 * 目前為示意資料，型別由此頁面擁有；
 * 待 API 串接後僅需替換資料來源。
 */
const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "note-1",
    userId: "user-1",
    type: "file.uploaded",
    title: "檔案上傳完成",
    body: "合約範本.pdf 已上傳至物件儲存。",
    linkPath: "/files",
    actorUserId: "user-2",
    actorLabel: "系統管理員",
    readAt: null,
    createdAt: "2026-09-22T01:20:00.000Z",
  },
  {
    id: "note-2",
    userId: "user-1",
    type: "system.notice",
    title: "權限模組尚未上線",
    body: "permission 模組完成後，此頁面將依角色顯示可存取的模組入口。",
    linkPath: "/settings",
    actorUserId: null,
    actorLabel: null,
    readAt: "2026-09-22T02:00:00.000Z",
    createdAt: "2026-09-21T09:05:00.000Z",
  },
];

/** 以統一的格式呈現時間，避免伺服器與瀏覽器時區差異造成顯示不一致。 */
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationList({
  items,
  emptyText,
}: {
  items: AppNotification[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((item, index) => (
        <li key={item.id} className="flex flex-col gap-3">
          {index > 0 ? <Separator /> : null}
          <div className="flex flex-wrap items-start justify-between gap-2 py-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-medium">
                {item.title}
                {item.readAt === null ? (
                  <Badge variant="destructive">未讀</Badge>
                ) : null}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {item.body ?? "（無內容）"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                來源：{item.actorLabel ?? "系統"} ·{" "}
                {formatDateTime(item.createdAt)} · 導向 {item.linkPath}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function NotificationsPage() {
  const unread = SAMPLE_NOTIFICATIONS.filter((item) => item.readAt === null);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4" />
            通知中心
          </CardTitle>
          <CardDescription>
            目前為示意資料。實際資料將來自 public-service 的 notification
            模組，並可依 linkPath 導向對應模組頁面。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                全部（{SAMPLE_NOTIFICATIONS.length}）
              </TabsTrigger>
              <TabsTrigger value="unread">未讀（{unread.length}）</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <NotificationList
                items={SAMPLE_NOTIFICATIONS}
                emptyText="目前沒有通知"
              />
            </TabsContent>
            <TabsContent value="unread">
              <NotificationList items={unread} emptyText="沒有未讀通知" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 通知模組相關型別。
 *
 * 對應 apps/backend 的 notification 模組與 notification.prisma，
 * 前端 Notification Center 直接依這些欄位渲染，不需要再各自定義。
 */

/**
 * 站內通知。
 *
 * linkPath 只存前端路徑而非完整網址，
 * 因此前端導向時必須自行接上目前的網域。
 */
export interface AppNotification {
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
}

/**
 * Email 寄送紀錄。
 *
 * attachments 為 JSON 欄位，實際結構由寄送端決定，
 * 前端僅用於顯示，故不強制細部型別以免與後端格式綁死。
 */
export interface EmailNotificationLog {
  id: string;
  actorUserId: string | null;
  actorEmail: string | null;
  recipient: string;
  template: string | null;
  provider: string;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  attachments: unknown;
  createdAt: string;
}

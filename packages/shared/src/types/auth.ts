/**
 * 身分驗證相關型別。
 *
 * 欄位與 apps/backend 的 Prisma Schema（auth.prisma）保持一致；
 * 前端若自行複製一份，Schema 調整後就會出現「欄位存在但型別說沒有」的落差。
 */

/** 使用者狀態，對應 Prisma enum UserStatus。 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

/**
 * 對外的使用者資料。
 *
 * 刻意不包含 UserPassword 的 passwordHash：
 * 即使後端不慎回傳，前端型別也不會把它當成可用欄位，
 * 降低敏感欄位被顯示在畫面上的機會。
 */
export interface User {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/** 應用程式（例如 Drawer、Canvas），角色隸屬於某個 App 之下。 */
export interface App {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/** App 內的角色，例如 USER、VIP、ADMIN。 */
export interface Role {
  id: string;
  appId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 使用者與角色的關聯。 */
export interface UserRole {
  userId: string;
  roleId: string;
  createdAt: string;
}

/**
 * 使用者工作階段。
 *
 * 不包含 tokenHash：雜湊值僅供後端比對，出現在前端只會增加外洩風險。
 */
export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 第三方登入帳號綁定。 */
export interface OauthAccount {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

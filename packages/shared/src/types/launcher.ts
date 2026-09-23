/**
 * App 入口（Launcher）的共用型別與常數。
 *
 * 為什麼放在 @test/shared：
 * 「登入者看得到哪些 App」由後端決定（apps 表 + 使用者的角色），
 * 前端只負責把結果畫成卡片。兩端若各自宣告欄位名稱，
 * 改動時很容易只更新其中一邊，前端就會拿到 undefined 卻沒有任何錯誤訊息。
 */

import {
  CANVAS_PAGE_PATH,
  CONSOLE_PAGE_PATH,
} from '../constants/api.js';
import {
  CANVAS_APP_NAME,
  CONSOLE_APP_NAME,
} from '../constants/auth.js';

/**
 * 一張 App 卡片「為什麼看得到」。
 *
 * ROLE：登入者在該 App 被指派了角色，因此可進入。
 * PLATFORM_ADMIN：登入者在 public-service 具備 ADMIN 角色，
 * 平台管理工具（控制台）因此對他可見。
 */
export const APP_ACCESS_SOURCE = {
  ROLE: 'role',
  PLATFORM_ADMIN: 'platform-admin',
} as const;

export type AppAccessSource =
  (typeof APP_ACCESS_SOURCE)[keyof typeof APP_ACCESS_SOURCE];

/** 入口頁的一張 App 卡片。 */
export interface LauncherApp {
  id: string;
  name: string;
  description: string | null;
  /** 登入者在這個 App 被指派的角色名稱（沒有角色時為空陣列）。 */
  roleNames: string[];
  /** 這張卡片為什麼可見，供畫面標示權限來源。 */
  accessSource: AppAccessSource;
}

/**
 * 後端 `GET /api/apps/mine` 的回應內容。
 *
 * 這是入口頁唯一的資料來源：後端以資料庫的 apps 表為底，
 * 逐一判斷登入者可否進入，前端不得再自行增減或寫死任何 App。
 */
export interface MyAppsResponse {
  /** 是否具備 public-service 的 ADMIN 角色（平台管理權）。 */
  isAdmin: boolean;
  /** 登入者可進入的 App 清單（已依入口頁順序排序）。 */
  apps: LauncherApp[];
}

/**
 * 入口頁的 App 顯示順序。
 *
 * 平台管理工具排在前面；未列出的 App 由後端依名稱排序接在後面，
 * 因此新增 App 時不必回頭修改這份清單也能正常顯示。
 */
export const LAUNCHER_APP_ORDER: readonly string[] = [
  CONSOLE_APP_NAME,
  CANVAS_APP_NAME,
];

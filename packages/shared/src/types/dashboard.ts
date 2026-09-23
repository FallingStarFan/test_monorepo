/**
 * 前端總覽頁（Dashboard）的共用型別與常數。
 *
 * 為什麼放在 @test/shared：
 * 總覽頁的資料已改由後端 API 提供，後端負責組出 payload、前端負責顯示，
 * 兩端必須對同一組欄位名稱有共識。若各自宣告一份，改動時很容易只更新
 * 其中一邊，前端就會拿到 undefined 卻沒有任何錯誤訊息。
 */

import { API_PREFIX } from '../constants/api.js';

/**
 * 後端提供總覽資料的端點（含全域路由前綴）。
 *
 * 與其他 public-service 管理 API 一樣掛在 /admin 之下，
 * 語意上就能看出「這是管理用途、需要 ADMIN 角色」。
 */
export const DASHBOARD_OVERVIEW_API_PATH =
  `${API_PREFIX}/admin/dashboard/overview` as const;

/**
 * 前端 BFF（Next.js Route Handler）的路徑。
 *
 * 瀏覽器只呼叫這個同源路徑，由 Next.js 伺服器端讀取 HttpOnly Cookie
 * 後轉發給後端；Access Token 因此不會出現在瀏覽器可見的請求中，
 * 瀏覽器也不需要直接跨域呼叫後端。
 */
export const DASHBOARD_OVERVIEW_BFF_PATH = '/api/dashboard/overview' as const;

/**
 * 總覽頁顯示的模組覆蓋狀態。
 *
 * 前端原本以字串 '骨架完成' 直接比對來決定標籤顏色；字串一旦由後端提供，
 * 兩端各自寫死就會出現「顏色判斷失效但畫面看起來正常」的隱性錯誤，
 * 因此收斂成常數。
 */
export const DASHBOARD_MODULE_STATUS = {
  /** 後端模組已有對應的前端頁面。 */
  DONE: '骨架完成',
  /** 後端模組尚無對應的前端頁面。 */
  TODO: '待辦',
} as const;

export type DashboardModuleStatus =
  (typeof DASHBOARD_MODULE_STATUS)[keyof typeof DASHBOARD_MODULE_STATUS];

/** 單一後端模組與前端頁面的對應關係。 */
export interface DashboardModuleCoverage {
  /** 後端模組路徑。 */
  backend: string;
  /** 對應的前端頁面或尚未建立的說明。 */
  frontend: string;
  /** 覆蓋狀態。 */
  status: DashboardModuleStatus;
}

/** 分頁參數預設值（實際數值來源為 constants/api.ts 的 PAGINATION）。 */
export interface DashboardPaginationDefaults {
  defaultPage: number;
  defaultPageSize: number;
  maxPageSize: number;
}

/** 總覽頁「串接資訊」區塊的資料。 */
export interface DashboardEndpointsInfo {
  /** 後端 API 根網址（含全域前綴）。 */
  apiBaseUrl: string;
  /** 後端全域路由前綴。 */
  apiPrefix: string;
  /** 後端 Port。 */
  apiPort: number;
  /** 前端網址。 */
  webOrigin: string;
  /** 前端 Port。 */
  webPort: number;
  /** 前後端共用的套件名稱。 */
  sharedPackageName: string;
  /** 共用套件提供的內容說明。 */
  sharedPackagePurpose: string;
  /** 分頁預設值。 */
  pagination: DashboardPaginationDefaults;
}

/**
 * 後端 `GET /api/admin/dashboard/overview` 的回應內容。
 *
 * 這是總覽頁唯一允許的資料來源：頁面上顯示的 API 位址、前端網址、
 * 共用套件、分頁預設值與模組覆蓋狀態都必須由此取得，
 * 前端不得再自行寫死，否則「畫面上的資訊」與「後端實際設定」會各自漂移。
 */
export interface DashboardOverview {
  /** 後端產生這份資料的時間（ISO 8601）。 */
  generatedAt: string;
  /** 串接資訊。 */
  endpoints: DashboardEndpointsInfo;
  /** 模組覆蓋狀態。 */
  modules: DashboardModuleCoverage[];
}

/**
 * 身分驗證相關的共用常數。
 *
 * 這些字串會同時出現在資料庫資料、後端 Guard 與前端選單判斷中；
 * 只要有一處拼錯就會變成「看起來有權限卻進不去」的疑難問題，
 * 因此集中定義為單一來源。
 */

/**
 * public-service 在資料庫 App 表中的名稱。
 *
 * 後端 permission 模組的管理 API 會以「使用者是否具備這個 App 的角色」
 * 作為第一道關卡，前端也需要同一個字串才能組出對應的權限查詢與頁面顯示；
 * 兩端各自寫死的話，只要有一邊拼錯就會變成永遠 403 的 NO_APP_ROLE。
 */
export const PUBLIC_SERVICE_APP_NAME = 'public-service' as const;

/**
 * 平台管理工具（控制台）在資料庫 App 表中的名稱。
 *
 * 控制台只是眾多 App 的其中一個：它沒有角色指派，而是以
 * 「登入者是否具備 public-service 的 ADMIN 角色」作為可見條件。
 * 後端據此決定要不要把控制台放進入口頁的 App 清單，
 * 前端不需要（也不應該）自己塞一張寫死的卡片。
 */
export const CONSOLE_APP_NAME = 'console' as const;

/**
 * Canvas 白板在資料庫 App 表中的名稱。
 *
 * 與其他 App 一樣，是否出現在入口頁完全由「資料庫是否有這一列」
 * 加上「登入者在該 App 是否有角色」決定；前端不維護寫死的 App 清單。
 */
export const CANVAS_APP_NAME = 'canvas' as const;

/**
 * 可管理 public-service API 的系統角色名稱。
 *
 * 需求明定管理類 API 只有 public-service 的 admin 角色可執行，
 * 此常數即為 Guard 判斷的比對基準（實際資料仍以資料庫 Role 資料為準）。
 *
 * 注意：Role 名稱在資料庫中視為大小寫不同的字串，
 * 因此這裡必須與 seed 寫入的 'ADMIN' 完全一致，改動任一處都會讓管理 API 全部失效。
 */
export const SYSTEM_ROLE_ADMIN = 'ADMIN' as const;

/**
 * 目前支援的第三方登入 Provider。
 *
 * 對應後端 auth/strategies 下的 GitHub 與 Google 策略；
 * 前端登入按鈕需要以此值組出導向網址。
 */
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
} as const;

export type OAuthProvider =
  (typeof OAUTH_PROVIDERS)[keyof typeof OAUTH_PROVIDERS];

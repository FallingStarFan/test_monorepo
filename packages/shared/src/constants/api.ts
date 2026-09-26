/**
 * 後端 API 的共用常數。
 *
 * 這些值同時被前後端引用；若兩端各自寫死字串，只要有一邊改了路徑或錯誤碼，
 * 另一邊就會出現難以定位的 404 或錯誤判斷失準，因此集中在這裡定義。
 */

/** 後端於 main.ts 設定的全域路由前綴（app.setGlobalPrefix('api')）。 */
export const API_PREFIX = '/api' as const;

/** 後端預設 Port，對應 apps/backend/.env 的 SERVER_PORT 預設值。 */
export const DEFAULT_API_PORT = 3013 as const;

/**
 * 前端預設 Port。
 *
 * 後端 CORS 的 WEB_ORIGIN 必須與前端實際網址一致，
 * 否則瀏覽器不會帶上 Session Cookie，登入狀態會無故失效。
 */
export const DEFAULT_WEB_PORT = 3000 as const;

/** 開發環境的後端 API 根網址（前端 .env 未設定時的 fallback）。 */
export const DEFAULT_API_BASE_URL = `http://localhost:${DEFAULT_API_PORT}${API_PREFIX}` as const;

/**
 * 分頁參數預設值。
 *
 * 前端與後端共用同一組上限，避免前端要求超過後端允許的筆數而造成 400。
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * 授權相關的錯誤碼。
 *
 * 前端要靠錯誤碼決定要「導向登入頁」還是「顯示權限不足」，
 * 因此必須是穩定字串，不能直接判斷會隨時調整的中文訊息文字。
 *
 * 這些碼由 public-service 的 permission 模組（Guard）負責回傳：
 * - 未登入 → 401（無錯誤碼）
 * - 已登入但沒有該 App 的角色 → 403 NO_APP_ROLE
 * - 有 App 角色但缺少該 API 權限 → 403 PERMISSION_DENIED
 */
export const AUTH_ERROR_CODES = {
  /** 已登入但未被指派該 App 的任何角色。 */
  NO_APP_ROLE: 'NO_APP_ROLE',
  /** 有該 App 的角色，但沒有執行此 API 所需的權限。 */
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/**
 * 與後端 HttpExceptionFilter 一致的常用 HTTP 狀態碼語意。
 *
 * 專案以「雙語訊息 + 狀態碼」回傳錯誤，前端若直接寫數字，
 * 之後閱讀程式碼時無法判斷該數字對應的授權情境。
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 後端既有端點路徑（皆已含 API_PREFIX）。
 *
 * 前端一律透過 BFF 轉發呼叫這些端點，不在瀏覽器直接跨域請求，
 * 因此路徑字串必須前後端共用同一份定義，避免兩邊各寫一次而逐漸漂移。
 */
export const ADMIN_APPS_API_PATH = `${API_PREFIX}/admin/apps` as const;
/** ???????? App ????????????? */
export const REGISTERED_APPS_API_PATH = `${API_PREFIX}/apps` as const;
export const MY_PERMISSION_API_PATH = `${API_PREFIX}/permissions/me` as const;
export const FILE_UPLOAD_URL_API_PATH = `${API_PREFIX}/file/upload-url` as const;
export const FILE_METADATA_API_PATH = `${API_PREFIX}/file` as const;
export const AUTH_LOGIN_API_PATH = `${API_PREFIX}/auth/login` as const;
export const AUTH_LOGOUT_API_PATH = `${API_PREFIX}/auth/logout` as const;
export const AUTH_ME_API_PATH = `${API_PREFIX}/auth/me` as const;

/**
 * 登入者可進入的 App 清單。
 *
 * 刻意不放在 /admin 之下：一般使用者也要看得到自己的 App 入口，
 * 這個端點只需要登入、不需要任何角色（沒有角色時回傳空清單而不是 403）。
 */
export const MY_APPS_API_PATH = `${API_PREFIX}/apps/mine` as const;

/**
 * 前端 BFF（Next.js Route Handler）路徑。
 *
 * 這些是瀏覽器唯一會呼叫的位址；實際的授權結果仍由後端決定，
 * BFF 只負責帶著 HttpOnly Cookie 轉發，不自行判斷登入狀態。
 */
export const ADMIN_APPS_BFF_PATH = '/api/admin/apps' as const;
export const MY_PERMISSION_BFF_PATH = '/api/permissions/me' as const;
export const MY_APPS_BFF_PATH = '/api/apps/mine' as const;
export const AUTH_LOGIN_BFF_PATH = '/api/auth/login' as const;
export const AUTH_LOGOUT_BFF_PATH = '/api/auth/logout' as const;
export const AUTH_SESSION_BFF_PATH = '/api/auth/session' as const;
export const FILE_UPLOAD_URL_BFF_PATH = '/api/file/upload-url' as const;
export const FILE_METADATA_BFF_PATH = '/api/file' as const;

/** 前端登入頁路徑（未登入或需要切換帳號時的導向目標）。 */
export const LOGIN_PAGE_PATH = '/login' as const;

/** 前端 App 入口頁路徑（登入後的預設落地頁，列出可進入的 App 卡片）。 */
export const LAUNCHER_PAGE_PATH = '/' as const;

/** 前端控制台頁面路徑（控制台已從首頁獨立為一個 App，僅 ADMIN 可進入）。 */
export const CONSOLE_PAGE_PATH = '/console' as const;

/** 前端 Canvas 白板頁面路徑。 */
export const CANVAS_PAGE_PATH = '/canvas' as const;

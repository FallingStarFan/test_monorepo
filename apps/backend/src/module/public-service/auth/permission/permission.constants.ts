import {
  PUBLIC_SERVICE_APP_NAME,
  SYSTEM_ROLE_ADMIN,
} from '@test/shared';

// ============================================================
// 權限碼
// ============================================================

/**
 * 為什麼要把權限碼收斂成常數：
 *
 * 權限碼是「字串比對」——Guard、Controller、seed、測試與前端都會引用同一組字串，
 * 只要有一處打錯字，程式不會有任何編譯錯誤，只會表現成「永遠 403」，
 * 而且非常難查。把它集中在這個檔案，其他程式碼一律引用常數，
 * 打錯字就會在編譯期被 TypeScript 擋下來。
 */
export const PERMISSION_CODES = {
  APP_READ: 'app:read',
  APP_WRITE: 'app:write',
  ROLE_READ: 'role:read',
  ROLE_WRITE: 'role:write',
  PERMISSION_READ: 'permission:read',
  PERMISSION_WRITE: 'permission:write',
  ROLE_PERMISSION_READ: 'role-permission:read',
  ROLE_PERMISSION_WRITE: 'role-permission:write',
} as const;

export type PermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];

export interface PermissionCatalogEntry {
  code: PermissionCode;
  name: string;
  description: string;
}

/**
 * 為什麼要有這份清單：
 *
 * seed 需要「建立哪些權限」、Swagger 與文件需要「每個權限碼是什麼意思」，
 * 這兩件事本質是同一份資料。放在一起可以避免 seed 建立了某個權限碼、
 * 但文件上查不到，或反過來文件寫了但資料庫沒有的情況。
 */
export const PERMISSION_CATALOG: readonly PermissionCatalogEntry[] = [
  {
    code: PERMISSION_CODES.APP_READ,
    name: '讀取 App',
    description: '查詢 App 清單與單一 App 的設定。',
  },
  {
    code: PERMISSION_CODES.APP_WRITE,
    name: '管理 App',
    description: '建立、修改、刪除 App。',
  },
  {
    code: PERMISSION_CODES.ROLE_READ,
    name: '讀取 Role',
    description: '查詢 App 下的角色清單與單一角色。',
  },
  {
    code: PERMISSION_CODES.ROLE_WRITE,
    name: '管理 Role',
    description: '建立、修改、刪除角色。',
  },
  {
    code: PERMISSION_CODES.PERMISSION_READ,
    name: '讀取 Permission',
    description: '查詢權限碼清單與單一權限碼。',
  },
  {
    code: PERMISSION_CODES.PERMISSION_WRITE,
    name: '管理 Permission',
    description: '建立、修改、刪除權限碼。',
  },
  {
    code: PERMISSION_CODES.ROLE_PERMISSION_READ,
    name: '讀取角色權限指派',
    description: '查詢某個角色目前被指派了哪些權限碼。',
  },
  {
    code: PERMISSION_CODES.ROLE_PERMISSION_WRITE,
    name: '管理角色權限指派',
    description: '新增、覆蓋、移除角色與權限碼的指派關係。',
  },
];

// ============================================================
// 管理 API 的範圍
// ============================================================

/**
 * 管理 API 預設檢查的 App。
 *
 * 之所以給預設值而不是讓每個 Controller 自己寫：管理 API 幾乎都屬於
 * public-service 自己，只有未來新增其他 App 的管理端點時才需要用
 * `@AppScope('其他 App')` 覆寫，預設值能避免每個端點重複貼同一組字串。
 */
export const DEFAULT_APP_SCOPE = PUBLIC_SERVICE_APP_NAME;

/**
 * 允許執行管理 API 的角色名稱。
 *
 * 需求是「只有 public-service 的 admin 角色可執行」，因此這裡的角色檢查
 * 與權限碼檢查是「且」的關係：先確認有這個角色，再看角色是否帶對應權限碼。
 */
export const ADMIN_ROLE_NAME = SYSTEM_ROLE_ADMIN;

// ============================================================
// Metadata Keys
// ============================================================

/**
 * 為什麼集中宣告 metadata key：
 *
 * Decorator 寫入與 Guard 讀取必須使用完全相同的字串，一旦兩邊字串不一致，
 * Reflector 只會回傳 undefined，Guard 就會「全部放行」——這是安全性問題，
 * 而且不會有任何錯誤訊息。集中宣告讓這個字串只存在一個地方。
 */
export const APP_SCOPE_METADATA_KEY = 'permission:app-scope';
export const REQUIRED_ROLES_METADATA_KEY = 'permission:required-roles';
export const REQUIRED_PERMISSIONS_METADATA_KEY =
  'permission:required-permissions';

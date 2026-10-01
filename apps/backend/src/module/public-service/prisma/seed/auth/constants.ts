// ============================================================
// App
// ============================================================

/**
 * 系統內建的 App 清單。
 * 新增 / 移除 App 時，只需要改這裡，apps.seed.ts、roles.seed.ts 會自動套用。
 */
export const APP_NAMES = ['Console', 'Canvas'] as const;
export type AppName = (typeof APP_NAMES)[number];

// ============================================================
// Role
// ============================================================

/**
 * 每個 App 預設都要擁有的角色。
 * 新增 / 移除角色時，只需要改這裡，roles.seed.ts 會自動幫「每一個」App
 * 都建立一份（例如 Console 和 Canvas 各自都會有自己的 USER / VIP / ADMIN）。
 */
export const DEFAULT_ROLE_NAMES = ['USER', 'VIP', 'ADMIN'] as const;
export type DefaultRoleName = (typeof DEFAULT_ROLE_NAMES)[number];

// ============================================================
// Admin User
// ============================================================

/** 預設管理員帳號的 email，同時也是 user.seed.ts 判斷「是否已經 seed 過」的依據 */
export const ADMIN_EMAIL = 'admin@example.com';

/** 預設管理員帳號的顯示名稱 */
export const ADMIN_NAME = 'Admin';

/** 管理員帳號要掛在哪個 App 底下。如果管理後台不是 Console，改這裡就好 */
export const ADMIN_APP_NAME: AppName = 'Console';

/** 管理員帳號要被授予哪個角色，通常就是 DEFAULT_ROLE_NAMES 裡的 ADMIN */
export const ADMIN_ROLE_NAME: DefaultRoleName = 'ADMIN';

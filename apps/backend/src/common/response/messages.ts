/**
 * 所有系統訊息的集中定義。
 * key 用 SCREAMING_SNAKE_CASE，依功能分類排列，方便搜尋與維護。
 */
export const MESSAGES = {
  // ============================================================
  // Auth（登入、驗證、Session）
  // ============================================================
  INVALID_CREDENTIALS: {
    en: 'Invalid email or password',
    zh: 'Email 或密碼錯誤',
  },
  UNAUTHORIZED: {
    en: 'You are not authorized to perform this action',
    zh: '你沒有權限執行此操作',
  },
  TOKEN_EXPIRED: {
    en: 'Your session has expired, please log in again',
    zh: '登入已過期，請重新登入',
  },
  TOKEN_INVALID: {
    en: 'Invalid or malformed token',
    zh: '無效的驗證憑證',
  },
  TOKEN_INVALID_OR_EXPIRED: {
    en: 'Authentication token is invalid or expired',
    zh: '登入憑證無效或已過期',
  },
  SESSION_NOT_FOUND: {
    en: 'Session not found',
    zh: '找不到此登入階段',
  },
  SESSION_REVOKED: {
    en: 'This session has been revoked',
    zh: '此登入階段已被撤銷',
  },
  EMAIL_NOT_VERIFIED: {
    en: 'Please verify your email before continuing',
    zh: '請先完成 Email 驗證',
  },
  ACCOUNT_BANNED: {
    en: 'This account has been banned',
    zh: '此帳號已被停權',
  },
  ACCOUNT_INACTIVE: {
    en: 'This account is inactive',
    zh: '此帳號尚未啟用',
  },
  OAUTH_ACCOUNT_ALREADY_LINKED: {
    en: 'This OAuth account is already linked to another user',
    zh: '此第三方帳號已綁定到其他使用者',
  },
  AUTH_REGISTERED: {
    en: 'Account registered and signed in successfully',
    zh: '帳號建立並登入成功',
  },
  AUTH_LOGIN_SUCCESS: { en: 'Signed in successfully', zh: '登入成功' },
  CURRENT_USER_RETRIEVED: {
    en: 'Current user retrieved successfully',
    zh: '取得目前使用者成功',
  },
  TOKEN_REFRESHED: { en: 'Token refreshed successfully', zh: 'Token 更新成功' },
  LOGOUT_SUCCESS: { en: 'Signed out successfully', zh: '登出成功' },
  REFRESH_TOKEN_MISSING: {
    en: 'Refresh token is missing',
    zh: '缺少 Refresh Token',
  },
  OAUTH_STATE_INVALID: {
    en: 'Invalid OAuth state',
    zh: 'OAuth state 驗證失敗',
  },
  OAUTH_EMAIL_NOT_LINKABLE: {
    en: 'This OAuth email cannot be linked automatically',
    zh: '此 OAuth Email 無法自動連結既有帳號',
  },

  // ============================================================
  // User
  // ============================================================
  USER_NOT_FOUND: {
    en: 'User not found',
    zh: '找不到使用者',
  },
  EMAIL_ALREADY_EXISTS: {
    en: 'Email already exists',
    zh: 'Email 已被註冊',
  },
  PASSWORD_TOO_WEAK: {
    en: 'Password does not meet security requirements',
    zh: '密碼強度不符合安全要求',
  },
  OLD_PASSWORD_INCORRECT: {
    en: 'Current password is incorrect',
    zh: '目前的密碼不正確',
  },
  CANNOT_DELETE_SELF: {
    en: 'You cannot delete your own account',
    zh: '無法刪除自己的帳號',
  },
  USER_CREATED: { en: 'User created successfully', zh: '建立使用者成功' },
  USERS_RETRIEVED: {
    en: 'Users retrieved successfully',
    zh: '取得使用者列表成功',
  },
  USER_RETRIEVED: { en: 'User retrieved successfully', zh: '取得使用者成功' },
  USER_UPDATED: { en: 'User updated successfully', zh: '更新使用者成功' },
  USER_DELETED: { en: 'User deleted successfully', zh: '刪除使用者成功' },
  PASSWORD_CREATED: { en: 'Password created successfully', zh: '建立密碼成功' },
  PASSWORD_UPDATED: { en: 'Password updated successfully', zh: '更新密碼成功' },
  USER_PASSWORD_ALREADY_EXISTS: {
    en: 'User password already exists',
    zh: '使用者密碼已經存在',
  },
  USER_PASSWORD_NOT_FOUND: {
    en: 'User password not found',
    zh: '找不到使用者密碼',
  },

  // ============================================================
  // App / Role / Permission
  // ============================================================
  APP_NOT_FOUND: {
    en: 'App not found',
    zh: '找不到此 App',
  },
  ROLE_NOT_FOUND: {
    en: 'Role not found',
    zh: '找不到此角色',
  },
  ROLE_ALREADY_EXISTS: {
    en: 'A role with this name already exists in this app',
    zh: '此 App 下已存在相同名稱的角色',
  },
  PERMISSION_DENIED: {
    en: 'You do not have permission to perform this action',
    zh: '你沒有權限執行此操作',
  },
  CANNOT_REMOVE_LAST_ADMIN: {
    en: 'Cannot remove the last admin of this app',
    zh: '無法移除此 App 的最後一位管理員',
  },
  APPS_RETRIEVED: {
    en: 'Apps retrieved successfully',
    zh: '取得 App 列表成功',
  },
  APP_RETRIEVED: { en: 'App retrieved successfully', zh: '取得 App 成功' },
  APP_NAME_ALREADY_EXISTS: {
    en: 'App name already exists',
    zh: 'App 名稱已存在',
  },
  ROLES_RETRIEVED: {
    en: 'Roles retrieved successfully',
    zh: '取得角色列表成功',
  },
  ROLE_RETRIEVED: { en: 'Role retrieved successfully', zh: '取得角色成功' },
  ROLE_CREATED: { en: 'Role created successfully', zh: '建立角色成功' },
  ROLE_UPDATED: { en: 'Role updated successfully', zh: '更新角色成功' },
  ROLE_DELETED: { en: 'Role deleted successfully', zh: '刪除角色成功' },
  MY_ROLES_RETRIEVED: {
    en: 'My roles retrieved successfully',
    zh: '取得目前登入者角色成功',
  },
  USER_ROLES_RETRIEVED: {
    en: 'User roles retrieved successfully',
    zh: '取得使用者角色成功',
  },
  ROLE_ASSIGNED: { en: 'Role assigned successfully', zh: '角色指派成功' },
  ROLE_REVOKED: { en: 'Role revoked successfully', zh: '角色移除成功' },
  USER_ALREADY_HAS_ROLE: {
    en: 'User already has this role',
    zh: '使用者已擁有此角色',
  },
  USER_ROLE_NOT_FOUND: {
    en: 'User does not have this role',
    zh: '使用者沒有此角色',
  },
  OAUTH_ACCOUNT_ALREADY_EXISTS: {
    en: 'OAuth account already exists',
    zh: 'OAuth 帳號已經存在',
  },
  OAUTH_ACCOUNT_NOT_FOUND: {
    en: 'OAuth account not found',
    zh: '找不到 OAuth 帳號',
  },
  OAUTH_ACCOUNTS_RETRIEVED: {
    en: 'OAuth accounts retrieved successfully',
    zh: '取得 OAuth 帳號列表成功',
  },
  OAUTH_ACCOUNT_DELETED: {
    en: 'OAuth account deleted successfully',
    zh: '解除 OAuth 帳號成功',
  },

  // File
  FILE_NOT_FOUND: { en: 'File not found', zh: '找不到指定檔案' },
  FILE_BYTES_INVALID: {
    en: 'bytes must be a non-negative safe integer',
    zh: 'bytes 必須是非負安全整數',
  },
  FILE_UPLOAD_URL_CREATED: {
    en: 'Upload URL created successfully',
    zh: '成功建立檔案上傳 URL',
  },
  FILE_DOWNLOAD_URL_CREATED: {
    en: 'Download URL created successfully',
    zh: '成功建立檔案下載 URL',
  },
  RELATED_FILES_RETRIEVED: {
    en: 'Related files retrieved successfully',
    zh: '成功取得關聯檔案',
  },
  FILE_RETRIEVED: {
    en: 'File metadata retrieved successfully',
    zh: '成功取得檔案資料',
  },
  FILES_RETRIEVED: {
    en: 'File metadata list retrieved successfully',
    zh: '成功取得檔案列表',
  },
  FILE_CREATED: {
    en: 'File metadata created successfully',
    zh: '成功建立檔案資料',
  },
  FILE_UPDATED: {
    en: 'File metadata updated successfully',
    zh: '成功更新檔案資料',
  },
  FILE_DELETED: {
    en: 'File metadata deleted successfully',
    zh: '成功軟刪除檔案資料',
  },

  // Notification
  APP_NOTIFICATIONS_RETRIEVED: {
    en: 'App notifications retrieved successfully',
    zh: '成功取得使用者站內通知',
  },
  APP_NOTIFICATION_RETRIEVED: {
    en: 'App notification retrieved successfully',
    zh: '成功取得站內通知',
  },
  APP_NOTIFICATION_CREATED: {
    en: 'App notification created successfully',
    zh: '成功建立站內通知',
  },
  APP_NOTIFICATION_READ: {
    en: 'App notification marked as read',
    zh: '成功將站內通知標記為已讀',
  },
  EMAIL_LOGS_RETRIEVED: {
    en: 'Email notification logs retrieved successfully',
    zh: '成功取得 Email 通知紀錄',
  },
  EMAIL_LOG_RETRIEVED: {
    en: 'Email notification log retrieved successfully',
    zh: '成功取得 Email 通知紀錄',
  },

  // ============================================================
  // Validation（通用表單驗證）
  // ============================================================
  VALIDATION_FAILED: {
    en: 'Validation failed, please check your input',
    zh: '驗證失敗，請檢查輸入內容',
  },
  REQUIRED_FIELD_MISSING: {
    en: 'This field is required',
    zh: '此欄位為必填',
  },
  INVALID_EMAIL_FORMAT: {
    en: 'Invalid email format',
    zh: 'Email 格式不正確',
  },
  INVALID_UUID_FORMAT: {
    en: 'Invalid ID format',
    zh: 'ID 格式不正確',
  },
  BAD_REQUEST: { en: 'Bad request', zh: '請求資料錯誤' },
  AUTHENTICATION_REQUIRED: {
    en: 'Authentication is required',
    zh: '需要登入驗證',
  },
  CONFLICT: { en: 'Conflict', zh: '資料發生衝突' },
  UNPROCESSABLE_ENTITY: { en: 'Unprocessable entity', zh: '資料驗證失敗' },
  REQUEST_ORIGIN_NOT_ALLOWED: {
    en: 'Request origin is not allowed',
    zh: '不允許此請求來源',
  },
  REQUEST_FAILED: { en: 'Request failed', zh: '請求失敗' },
  BAD_GATEWAY: { en: 'Bad gateway', zh: '上游伺服器錯誤' },
  SERVICE_UNAVAILABLE: { en: 'Service unavailable', zh: '服務暫時無法使用' },

  // ============================================================
  // 通用 / 伺服器錯誤
  // ============================================================
  RESOURCE_NOT_FOUND: {
    en: 'Resource not found',
    zh: '找不到此資源',
  },
  INTERNAL_SERVER_ERROR: {
    en: 'Something went wrong, please try again later',
    zh: '系統發生錯誤，請稍後再試',
  },
  TOO_MANY_REQUESTS: {
    en: 'Too many requests, please slow down',
    zh: '請求過於頻繁，請稍後再試',
  },
  OPERATION_SUCCESS: {
    en: 'Operation completed successfully',
    zh: '操作成功',
  },
  SERVICE_STATUS_RETRIEVED: {
    en: 'Service status retrieved successfully',
    zh: '取得服務狀態成功',
  },
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type Locale = keyof (typeof MESSAGES)[MessageKey];

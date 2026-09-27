export const API_PREFIX = "/api" as const;

export const AUTH_LOGIN_API_PATH = `${API_PREFIX}/auth/login` as const;
export const AUTH_REGISTER_API_PATH = `${API_PREFIX}/auth/register` as const;
export const AUTH_REFRESH_API_PATH = `${API_PREFIX}/auth/refresh` as const;
export const AUTH_LOGOUT_API_PATH = `${API_PREFIX}/auth/logout` as const;
export const AUTH_ME_API_PATH = `${API_PREFIX}/auth/me` as const;
export const MY_PERMISSION_API_PATH = `${API_PREFIX}/permissions/me` as const;
export const FILE_UPLOAD_URL_API_PATH =
  `${API_PREFIX}/file/upload-url` as const;
export const FILE_METADATA_API_PATH = `${API_PREFIX}/file` as const;

export const LOGIN_PAGE_PATH = "/login" as const;
export const LAUNCHER_PAGE_PATH = "/" as const;

export const AUTH_ERROR_CODES = {
  NO_APP_ROLE: "NO_APP_ROLE",
  PERMISSION_DENIED: "PERMISSION_DENIED",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

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

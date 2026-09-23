/**
 * 後端統一回應格式的型別。
 *
 * 後端 HttpExceptionFilter 讓成功與失敗共用同一個外層結構，
 * 前端只要寫一次解析邏輯即可同時處理兩種情境，因此型別必須對齊該結構。
 */

/** 後端統一的雙語訊息格式。 */
export interface ApiMessage {
  en: string;
  zh: string;
}

/**
 * 後端統一回應 envelope。
 *
 * data 在失敗時固定為 null，因此使用端必須先檢查 statusCode 再取用 data，
 * 避免誤把 null 當成合法資料。
 */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: ApiMessage;
  data: T | null;
}

/** 失敗回應的別名，讓函式簽章可以明確表達「這裡只會拿到錯誤」。 */
export type ApiErrorResponse = ApiResponse<null>;

/**
 * 分頁查詢的共用參數。
 *
 * 兩端共用同一組欄位名稱，後端之後實作分頁端點時不需要再改前端程式碼。
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

/** 分頁結果的共用結構。 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

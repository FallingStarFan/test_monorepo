export interface ApiMessage {
  en: string;
  zh: string;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: ApiMessage;
  data: T | null;
}

export interface ApiErrorResponse extends ApiResponse<null> {
  code?: string;
}

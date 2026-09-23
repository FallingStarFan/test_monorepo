export interface ApiMessage {
  en: string;
  zh: string;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: ApiMessage;
  data: T | null;
}
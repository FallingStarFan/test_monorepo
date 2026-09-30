export type ApiMessage = {
  en: string;
  zh: string;
};

export type ApiFieldError = {
  field: string;
  code: string;
  message: string;
};

export type ApiResponse<T = null> = {
  statusCode: number;
  message: ApiMessage;
  data: T | null;
  code?: string;
  errors?: ApiFieldError[];
};
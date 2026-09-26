// apps/frontend/src/lib/api/auth.ts
import { api } from '../client';
type ApiResponse<T> = {
  statusCode: number;
  message: { en: string; zh: string };
  data: T;
};

type LoginUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginUser> {
  const response = await api.post<ApiResponse<LoginUser | null>>('/auth/login', {
    email,
    password,
  });

  const result = response.data;

  if (!result.data) {
    throw new Error(result.message?.zh ?? '登入失敗');
  }

  return result.data;
}
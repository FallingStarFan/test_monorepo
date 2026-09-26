import type { ApiResponse } from '@test/shared';
import { api } from '../client';

type AuthMeData = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
};


export async function getAuthMe(): Promise<ApiResponse<AuthMeData>> {
  const response = await api.get<ApiResponse<AuthMeData>>('/auth/me');
  return response.data;
}
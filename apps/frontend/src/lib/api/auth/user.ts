
import type { ApiResponse } from '../../../../../../packages/shared/dist/types/api';
import type { User } from '../../../../../../packages/shared/dist/types/auth';
import { api } from '../client';

export async function getUsers(): Promise<ApiResponse<User[]>> {
  const response = await api.get<ApiResponse<User[]>>('/users');
  return response.data;
}
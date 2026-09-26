import { api } from '../client';

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
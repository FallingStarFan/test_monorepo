import type {
  ApiResponse,
  AuthSessionData,
  PasswordLoginRequest,
} from "@test/shared";

import { api, unwrapApiData } from "../client";

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthSessionData> {
  const request: PasswordLoginRequest = { email, password };
  const response = await api.post<ApiResponse<AuthSessionData>>(
    "/auth/login",
    request,
  );

  return unwrapApiData(response.data);
}

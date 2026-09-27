import type { ApiResponse, AuthSessionData } from "@test/shared";

import { api, unwrapApiData } from "../client";

export async function getAuthMe(): Promise<AuthSessionData> {
  const response = await api.get<ApiResponse<AuthSessionData>>("/auth/me");
  return unwrapApiData(response.data);
}

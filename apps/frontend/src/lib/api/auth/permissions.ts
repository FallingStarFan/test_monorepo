import type { ApiResponse } from "@test/shared";

import { api, unwrapApiData } from "../client";

export interface MyPermissionsData {
  roleNames: string[];
  permissionCodes: string[];
}

export async function getMyPermissions(): Promise<MyPermissionsData> {
  const response =
    await api.get<ApiResponse<MyPermissionsData>>("/permissions/me");
  return unwrapApiData(response.data);
}

import type {
  ApiResponse,
  AuthSessionData,
} from "@test/shared";

import { api, unwrapApiData } from "../client";


import type { components } from '../generatedFromBackend/schema';

type PasswordLoginDto =
  components['schemas']['PasswordLoginDto'];



export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthSessionData> {
  const request: PasswordLoginDto = { email, password };
  const response = await api.post<ApiResponse<AuthSessionData>>(
    "/auth/login",
    request,
  );

  return unwrapApiData(response.data);
}

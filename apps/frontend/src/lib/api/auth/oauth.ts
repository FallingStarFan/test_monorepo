import type { OAuthProvider } from "@test/shared";

import { env } from "../../config/environment";

export function getOAuthUrl(provider: OAuthProvider, returnTo = "/"): string {
  const url = new URL(`${env.apiUrl}/auth/${provider}`);
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

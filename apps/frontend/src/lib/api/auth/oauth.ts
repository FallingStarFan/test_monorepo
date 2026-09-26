


export function getOAuthUrl(provider: string): string {
  return `/api/auth/${provider}`;
}
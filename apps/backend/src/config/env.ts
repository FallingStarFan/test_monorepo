import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile();
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function parseInteger(name: string, minimum = 1): number {
  const value = requiredEnv(name);

  if (!/^\d+$/.test(value) || Number(value) < minimum) {
    throw new Error(
      `${name} must be an integer greater than or equal to ${minimum}`,
    );
  }

  return Number(value);
}

function parseBoolean(name: string): boolean {
  const value = requiredEnv(name).toLowerCase();

  if (value !== 'true' && value !== 'false') {
    throw new Error(`${name} must be either true or false`);
  }

  return value === 'true';
}

function parseUrl(name: string): string {
  const value = requiredEnv(name);

  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error();
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} must be an absolute HTTP(S) URL`);
  }
}

function parseOrigin(name: string, value: string): string {
  const url = new URL(value);

  if (url.origin !== value.replace(/\/$/, '') || url.pathname !== '/') {
    throw new Error(`${name} entries must be exact origins without a path`);
  }

  return url.origin;
}

function parseDuration(name: string): `${number}${'s' | 'm' | 'h' | 'd'}` {
  const value = requiredEnv(name);

  if (!/^\d+[smhd]$/.test(value)) {
    throw new Error(`${name} must use a duration such as 15m or 7d`);
  }

  return value as `${number}${'s' | 'm' | 'h' | 'd'}`;
}

function parseSameSite(): 'lax' | 'strict' | 'none' {
  const value = requiredEnv('COOKIE_SAME_SITE').toLowerCase();

  if (value !== 'lax' && value !== 'strict' && value !== 'none') {
    throw new Error('COOKIE_SAME_SITE must be lax, strict, or none');
  }

  return value;
}

function parseCookieName(name: string): string {
  const value = requiredEnv(name);

  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`${name} contains invalid cookie-name characters`);
  }

  return value;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const frontendUrl = parseUrl('FRONTEND_URL');
const backendUrl = parseUrl('BACKEND_URL');
const corsOrigins = requiredEnv('CORS_ORIGINS')
  .split(',')
  .map((origin) => parseOrigin('CORS_ORIGINS', origin.trim()));
const cookieDomain = optionalEnv('COOKIE_DOMAIN');
const cookieSecure = parseBoolean('COOKIE_SECURE');
const cookieSameSite = parseSameSite();

if (!corsOrigins.includes(new URL(frontendUrl).origin)) {
  throw new Error('CORS_ORIGINS must include FRONTEND_URL');
}

if (cookieSameSite === 'none' && !cookieSecure) {
  throw new Error('COOKIE_SECURE must be true when COOKIE_SAME_SITE is none');
}

if (nodeEnv === 'production') {
  if (!cookieDomain) {
    throw new Error('Production COOKIE_DOMAIN is required');
  }

  if (!cookieSecure) {
    throw new Error('Production COOKIE_SECURE must be true');
  }

  if (
    !frontendUrl.startsWith('https://') ||
    !backendUrl.startsWith('https://')
  ) {
    throw new Error('Production FRONTEND_URL and BACKEND_URL must use HTTPS');
  }
} else if (cookieDomain) {
  throw new Error(
    'COOKIE_DOMAIN must be empty outside production (localhost uses host-only cookies)',
  );
}

const env = {
  nodeEnv,
  appName: requiredEnv('APP_NAME'),
  appVersion: requiredEnv('APP_VERSION'),
  serverPort: parseInteger('SERVER_PORT'),
  frontendUrl,
  backendUrl,
  corsOrigins,
  publicServiceDatabaseUrl: requiredEnv('PUBLIC_SERVICE_DATABASE_URL'),
  googleClientId: requiredEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
  googleCallbackUrl: parseUrl('GOOGLE_CALLBACK_URL'),
  githubClientId: requiredEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: requiredEnv('GITHUB_CLIENT_SECRET'),
  githubCallbackUrl: parseUrl('GITHUB_CALLBACK_URL'),
  jwtAccessExpires: parseDuration('JWT_ACCESS_EXPIRES'),
  jwtAccessSecret: requiredEnv('JWT_ACCESS_SECRET'),
  jwtRefreshExpires: parseDuration('JWT_REFRESH_EXPIRES'),
  jwtRefreshSecret: requiredEnv('JWT_REFRESH_SECRET'),
  cookieDomain,
  cookieSecure,
  cookieSameSite,
  accessCookieName: parseCookieName('COOKIE_NAME'),
  refreshCookieName: parseCookieName('REFRESH_COOKIE_NAME'),
  oauthStateCookieName: parseCookieName('OAUTH_STATE_COOKIE_NAME'),
  oauthReturnToCookieName: parseCookieName('OAUTH_RETURN_TO_COOKIE_NAME'),
  accessCookieMaxAgeMs: parseInteger('COOKIE_ACCESS_MAX_AGE_SECONDS') * 1000,
  refreshCookieMaxAgeMs: parseInteger('COOKIE_REFRESH_MAX_AGE_SECONDS') * 1000,
  oauthCookieMaxAgeMs: parseInteger('OAUTH_COOKIE_MAX_AGE_SECONDS') * 1000,
  localStorageDir: requiredEnv('LOCAL_STORAGE_DIR'),
  r2AccessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
  r2AccountId: requiredEnv('R2_ACCOUNT_ID'),
  r2Bucket: requiredEnv('R2_BUCKET'),
  r2PublicBaseUrl: requiredEnv('R2_PUBLIC_BASE_URL'),
  r2SecretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
  resendApiKey: requiredEnv('RESEND_API_KEY'),
  resendFromEmail: requiredEnv('RESEND_FROM_EMAIL'),
  signedUrlExpiresSeconds: parseInteger('SIGNED_URL_EXPIRES_SECONDS'),
  smtpFrom: requiredEnv('SMTP_FROM'),
  smtpPort: parseInteger('SMTP_PORT'),
  superAdminEmails: requiredEnv('SUPER_ADMIN_EMAILS')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean),
} as const;

export default env;
